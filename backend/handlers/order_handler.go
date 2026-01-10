package handlers

import (
	"log"
	"net/http"

	"storee/backend/models"
	"storee/backend/utils"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/datatypes"
	"gorm.io/gorm"
)

type OrderHandler struct {
	DB *gorm.DB
}

func NewOrderHandler(db *gorm.DB) *OrderHandler {
	return &OrderHandler{DB: db}
}

type CreateCODOrderRequest struct {
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

// CreateCODOrder handles POST /api/v1/orders/cod
func (h *OrderHandler) CreateCODOrder(c *gin.Context) {
	var req CreateCODOrderRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		log.Printf("COD Order validation error: %v", err)
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid request data", err)
		return
	}

	// Generate order ID
	orderID := "COD_" + uuid.New().String()
	log.Printf("Creating COD order: %s for customer: %s (%s)", orderID, req.Customer.Name, req.Customer.Email)

	// Check if user is authenticated
	var userID *uuid.UUID
	if userIDVal, exists := c.Get("userID"); exists {
		if uid, ok := userIDVal.(uuid.UUID); ok {
			userID = &uid
		}
	}

	// Create order record
	order := models.Order{
		OrderID:       orderID,
		UserID:        userID,
		CustomerName:  req.Customer.Name,
		CustomerEmail: req.Customer.Email,
		CustomerPhone: req.Customer.Phone,
		Address:       datatypes.JSON([]byte(utils.MustMarshalJSON(req.Address))),
		Items:         datatypes.JSON(utils.MustMarshalJSON(req.Items)),
		TotalAmount:   req.Amount,
		Status:        "pending",
		PaymentMethod: "cod",
	}

	if err := h.DB.Create(&order).Error; err != nil {
		log.Printf("Failed to create COD order in database: %v", err)
		c.Error(err) // Add error to context for logging middleware
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to create order", err)
		return
	}

	log.Printf("COD order created successfully: %s", orderID)
	utils.SuccessResponse(c, http.StatusCreated, "COD order created successfully", order)
}

// GetOrderHistory handles GET /api/v1/orders/history
func (h *OrderHandler) GetOrderHistory(c *gin.Context) {
	// Get user ID from context (set by auth middleware)
	userID, exists := c.Get("userID")
	if !exists {
		utils.ErrorResponse(c, http.StatusUnauthorized, "User not authenticated", nil)
		return
	}

	uid, ok := userID.(uuid.UUID)
	if !ok {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Invalid user ID", nil)
		return
	}

	// Get orders for this user, ordered by most recent first
	var orders []models.Order
	if err := h.DB.Where("user_id = ?", uid).
		Order("created_at DESC").
		Find(&orders).Error; err != nil {
		log.Printf("Failed to fetch order history: %v", err)
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to fetch orders", err)
		return
	}

	log.Printf("Retrieved %d orders for user %s", len(orders), uid)
	utils.SuccessResponse(c, http.StatusOK, "Orders retrieved successfully", orders)
}
