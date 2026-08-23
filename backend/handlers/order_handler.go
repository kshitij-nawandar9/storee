package handlers

import (
	"log"
	"net/http"

	"storee/backend/models"
	"storee/backend/services"
	"storee/backend/utils"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/datatypes"
	"gorm.io/gorm"
)

type OrderHandler struct {
	DB       *gorm.DB
	Notifier *services.Notifier
}

func NewOrderHandler(db *gorm.DB) *OrderHandler {
	return &OrderHandler{DB: db}
}

// WithNotifier attaches the order-notification outbox. Left unset (tests,
// unconfigured deploys) the handler simply queues nothing.
func (h *OrderHandler) WithNotifier(n *services.Notifier) *OrderHandler {
	h.Notifier = n
	return h
}

type CreateCODOrderRequest struct {
	Amount   int64 `json:"amount" binding:"required"`
	Items    []any `json:"items" binding:"required"`
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

	idempotencyKey, ok := requireIdempotencyKey(c)
	if !ok {
		return
	}

	requestHash, err := hashOrderCreateRequest("cod", req)
	if err != nil {
		log.Printf("Failed to hash COD order request: %v", err)
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to create order", err)
		return
	}

	existingOrder, err := findOrderByIdempotencyKey(h.DB, idempotencyKey)
	if err != nil {
		log.Printf("Failed to check COD idempotency key: %v", err)
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to create order", err)
		return
	}
	if existingOrder != nil {
		if !validateIdempotentOrder(c, existingOrder, requestHash) {
			return
		}
		log.Printf("Returning existing COD order for idempotency key: %s", idempotencyKey)
		utils.SuccessResponse(c, http.StatusOK, "COD order already created", existingOrder)
		return
	}

	// Generate unique 10-digit alphanumeric order ID
	// Retry if there's a collision (extremely rare with 36^10 possibilities)
	var orderID string
	var order models.Order
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

	log.Printf("Creating COD order: %s for customer: %s (%s)", orderID, req.Customer.Name, req.Customer.Email)

	// Check if user is authenticated
	var userID *uuid.UUID
	if userIDVal, exists := c.Get("userID"); exists {
		if uid, ok := userIDVal.(uuid.UUID); ok {
			userID = &uid
			log.Printf("COD Order: User authenticated, linking order to user: %s", uid)
		} else {
			log.Printf("COD Order: UserID exists but wrong type: %T", userIDVal)
		}
	} else {
		log.Printf("COD Order: No userID in context - guest order")
	}

	// Create order record
	order = models.Order{
		OrderID:         orderID,
		IdempotencyKey:  &idempotencyKey,
		IdempotencyHash: requestHash,
		UserID:          userID,
		CustomerName:    req.Customer.Name,
		CustomerEmail:   req.Customer.Email,
		CustomerPhone:   req.Customer.Phone,
		Address:         datatypes.JSON([]byte(utils.MustMarshalJSON(req.Address))),
		Items:           datatypes.JSON(utils.MustMarshalJSON(req.Items)),
		TotalAmount:     req.Amount,
		Status:          "pending",
		PaymentMethod:   "cod",
	}

	if err := h.DB.Create(&order).Error; err != nil {
		existingOrder, lookupErr := findOrderByIdempotencyKey(h.DB, idempotencyKey)
		if lookupErr == nil && existingOrder != nil {
			if !validateIdempotentOrder(c, existingOrder, requestHash) {
				return
			}
			log.Printf("Returning existing COD order after idempotency race: %s", idempotencyKey)
			utils.SuccessResponse(c, http.StatusOK, "COD order already created", existingOrder)
			return
		}
		log.Printf("Failed to create COD order in database: %v", err)
		c.Error(err) // Add error to context for logging middleware
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to create order", err)
		return
	}

	if userID != nil {
		log.Printf("COD order created successfully: %s, linked to user: %s", orderID, *userID)
	} else {
		log.Printf("COD order created successfully: %s (guest order)", orderID)
	}
	h.Notifier.Enqueue(h.DB, &order, services.EventOrderPlaced)

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
		log.Printf("Failed to fetch order history for user %s: %v", uid, err)
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to fetch orders", err)
		return
	}

	log.Printf("Retrieved %d orders for user %s", len(orders), uid)
	if len(orders) == 0 {
		log.Printf("No orders found for user %s. Checking if any orders exist with this user_id...", uid)
		// Debug: Check if there are any orders with this user_id
		var count int64
		h.DB.Model(&models.Order{}).Where("user_id = ?", uid).Count(&count)
		log.Printf("Total orders with user_id %s: %d", uid, count)
	}
	utils.SuccessResponse(c, http.StatusOK, "Orders retrieved successfully", orders)
}
