package handlers

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"log"
	"net/http"

	"storee/backend/config"
	"storee/backend/models"
	"storee/backend/services"
	"storee/backend/utils"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/datatypes"
	"gorm.io/gorm"
)

type RazorpayHandler struct {
	DB            *gorm.DB
	Config        *config.Config
	RazorpayClient *services.RazorpayClient
}

func NewRazorpayHandler(db *gorm.DB, cfg *config.Config) *RazorpayHandler {
	return &RazorpayHandler{
		DB:             db,
		Config:         cfg,
		RazorpayClient: services.NewRazorpayClient(cfg.RazorpayKeyID, cfg.RazorpaySecret),
	}
}

type CreateOrderRequest struct {
	Amount  int64  `json:"amount" binding:"required"`
	Items   []any  `json:"items" binding:"required"`
	Customer struct {
		Name  string `json:"name" binding:"required"`
		Email string `json:"email" binding:"required,email"`
		Phone string `json:"phone" binding:"required"`
	} `json:"customer" binding:"required"`
	Address struct {
		Line1   string `json:"line1" binding:"required"`
		Line2   string `json:"line2"`
		City    string `json:"city" binding:"required"`
		State   string `json:"state" binding:"required"`
		Pincode string `json:"pincode" binding:"required"`
	} `json:"address" binding:"required"`
}

type VerifyPaymentRequest struct {
	OrderID   string `json:"order_id" binding:"required"`
	PaymentID string `json:"payment_id" binding:"required"`
	Signature string `json:"signature" binding:"required"`
}

// CreateOrder handles POST /api/v1/razorpay/create-order
func (h *RazorpayHandler) CreateOrder(c *gin.Context) {
	var req CreateOrderRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid request data", err)
		return
	}

	// Generate unique 10-digit alphanumeric order ID
	// Retry if there's a collision (extremely rare with 36^10 possibilities)
	var orderID string
	maxRetries := 5
	for i := 0; i < maxRetries; i++ {
		orderID = utils.GenerateOrderID()
		
		// Check if order ID already exists
		var existingOrder models.Order
		if err := h.DB.Where("order_id = ?", orderID).First(&existingOrder).Error; err != nil {
			if err == gorm.ErrRecordNotFound {
				// Order ID is unique, proceed
				break
			}
			// Database error, try again
			if i == maxRetries-1 {
				log.Printf("Failed to check order ID uniqueness: %v", err)
				utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to create order", err)
				return
			}
			continue
		}
		// Order ID exists, generate a new one
		if i == maxRetries-1 {
			log.Printf("Failed to generate unique order ID after %d attempts", maxRetries)
			utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to generate unique order ID", nil)
			return
		}
	}
	
	// Create Razorpay order
	receipt := "receipt_" + orderID
	razorpayOrder, err := h.RazorpayClient.CreateOrder(req.Amount, receipt)
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to create Razorpay order", err)
		return
	}
	razorpayOrderID := razorpayOrder.ID

	// Check if user is authenticated
	var userID *uuid.UUID
	if userIDVal, exists := c.Get("userID"); exists {
		if uid, ok := userIDVal.(uuid.UUID); ok {
			userID = &uid
			log.Printf("Razorpay Order: User authenticated, linking order to user: %s", uid)
		} else {
			log.Printf("Razorpay Order: UserID exists but wrong type: %T", userIDVal)
		}
	} else {
		log.Printf("Razorpay Order: No userID in context - guest order")
	}

	// Create order record in database
	order := models.Order{
		OrderID:        orderID,
		RazorpayOrderID: razorpayOrderID,
		UserID:         userID,
		CustomerName:   req.Customer.Name,
		CustomerEmail:  req.Customer.Email,
		CustomerPhone:  req.Customer.Phone,
		Address:        datatypes.JSON([]byte(fmt.Sprintf(`{"line1":"%s","line2":"%s","city":"%s","state":"%s","pincode":"%s"}`, req.Address.Line1, req.Address.Line2, req.Address.City, req.Address.State, req.Address.Pincode))),
		Items:          datatypes.JSON(utils.MustMarshalJSON(req.Items)),
		TotalAmount:    req.Amount,
		Status:         "pending",
		PaymentMethod:  "razorpay",
	}

	if err := h.DB.Create(&order).Error; err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to create order", err)
		return
	}

	response := map[string]any{
		"order": map[string]any{
			"id":           order.ID.String(),
			"order_id":     orderID, // Our 10-digit order ID
			"razorpay_id":  razorpayOrderID,
			"amount":       order.TotalAmount,
			"currency":     "INR",
			"key_id":       h.Config.RazorpayKeyID,
		},
	}

	utils.SuccessResponse(c, http.StatusCreated, "Order created successfully", response)
}

// VerifyPayment handles POST /api/v1/razorpay/verify-payment
func (h *RazorpayHandler) VerifyPayment(c *gin.Context) {
	var req VerifyPaymentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid request data", err)
		return
	}

	// Verify signature - req.OrderID is Razorpay's order ID
	if !h.verifySignature(req.OrderID, req.PaymentID, req.Signature) {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid payment signature", nil)
		return
	}

	// Update order status - find order by Razorpay order ID
	var order models.Order
	if err := h.DB.Where("razorpay_order_id = ?", req.OrderID).First(&order).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			utils.ErrorResponse(c, http.StatusNotFound, "Order not found", nil)
			return
		}
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to verify payment", err)
		return
	}

	order.Status = "paid"
	order.PaymentID = req.PaymentID
	if err := h.DB.Save(&order).Error; err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to update order", err)
		return
	}

	response := map[string]string{
		"paymentId": req.PaymentID,
		"orderId":   order.OrderID, // Return our 10-digit order ID
	}

	utils.SuccessResponse(c, http.StatusOK, "Payment verified successfully", response)
}


// verifySignature verifies Razorpay payment signature
func (h *RazorpayHandler) verifySignature(orderID, paymentID, signature string) bool {
	message := orderID + "|" + paymentID
	mac := hmac.New(sha256.New, []byte(h.Config.RazorpaySecret))
	mac.Write([]byte(message))
	expectedSignature := hex.EncodeToString(mac.Sum(nil))
	return hmac.Equal([]byte(expectedSignature), []byte(signature))
}
