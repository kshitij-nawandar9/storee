package handlers

import (
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
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid request data", err)
		return
	}

	// Generate order ID
	orderID := "COD_" + uuid.New().String()

	// Create order record
	order := models.Order{
		OrderID:       orderID,
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
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to create order", err)
		return
	}

	utils.SuccessResponse(c, http.StatusCreated, "COD order created successfully", order)
}
