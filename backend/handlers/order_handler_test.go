package handlers

import (
	"encoding/json"
	"net/http"
	"testing"

	"storee/backend/models"
	"storee/backend/utils"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/datatypes"
)

func validCODOrderBody() []byte {
	body, _ := json.Marshal(map[string]interface{}{
		"amount": 10000,
		"items":  []map[string]interface{}{{"name": "Test Item", "qty": 1}},
		"customer": map[string]string{
			"name":  "John Doe",
			"email": "john@example.com",
			"phone": "9876543210",
		},
		"address": map[string]string{
			"line1":   "123 Test St",
			"line2":   "Apt 4",
			"city":    "Mumbai",
			"state":   "Maharashtra",
			"pincode": "400001",
		},
	})
	return body
}

func TestCreateCODOrder_Success(t *testing.T) {
	db := setupTestDB(t)
	h := NewOrderHandler(db)

	r := setupTestRouter()
	r.POST("/orders/cod", h.CreateCODOrder)

	w := performJSONRequest(r, "POST", "/orders/cod", validCODOrderBody(), nil)
	if w.Code != http.StatusCreated {
		t.Fatalf("status = %d, want %d, body: %s", w.Code, http.StatusCreated, w.Body.String())
	}

	var resp utils.ApiResponse
	json.Unmarshal(w.Body.Bytes(), &resp)
	if !resp.Success {
		t.Error("expected success=true")
	}

	order := resp.Data.(map[string]interface{})
	if order["paymentMethod"] != "cod" {
		t.Errorf("paymentMethod = %v, want cod", order["paymentMethod"])
	}
	if order["status"] != "pending" {
		t.Errorf("status = %v, want pending", order["status"])
	}
	orderID, _ := order["orderId"].(string)
	if len(orderID) != 10 {
		t.Errorf("orderId length = %d, want 10", len(orderID))
	}
}

func TestCreateCODOrder_MissingFields(t *testing.T) {
	db := setupTestDB(t)
	h := NewOrderHandler(db)

	r := setupTestRouter()
	r.POST("/orders/cod", h.CreateCODOrder)

	// Missing customer name
	body, _ := json.Marshal(map[string]interface{}{
		"amount": 10000,
		"items":  []map[string]interface{}{{"name": "item"}},
		"customer": map[string]string{
			"email": "john@example.com",
			"phone": "9876543210",
		},
		"address": map[string]string{
			"line1":   "123 St",
			"city":    "Mumbai",
			"state":   "Maharashtra",
			"pincode": "400001",
		},
	})

	w := performJSONRequest(r, "POST", "/orders/cod", body, nil)
	if w.Code != http.StatusBadRequest {
		t.Errorf("status = %d, want %d", w.Code, http.StatusBadRequest)
	}
}

func TestCreateCODOrder_GuestOrder(t *testing.T) {
	db := setupTestDB(t)
	h := NewOrderHandler(db)

	r := setupTestRouter()
	r.POST("/orders/cod", h.CreateCODOrder)

	w := performJSONRequest(r, "POST", "/orders/cod", validCODOrderBody(), nil)
	if w.Code != http.StatusCreated {
		t.Fatalf("status = %d, want %d", w.Code, http.StatusCreated)
	}

	var resp utils.ApiResponse
	json.Unmarshal(w.Body.Bytes(), &resp)
	order := resp.Data.(map[string]interface{})
	if order["userId"] != nil {
		t.Errorf("userId should be nil for guest order, got %v", order["userId"])
	}
}

func TestCreateCODOrder_AuthenticatedOrder(t *testing.T) {
	db := setupTestDB(t)
	h := NewOrderHandler(db)
	userID := uuid.New()

	r := setupTestRouter()
	r.POST("/orders/cod", func(c *gin.Context) {
		c.Set("userID", userID)
		h.CreateCODOrder(c)
	})

	w := performJSONRequest(r, "POST", "/orders/cod", validCODOrderBody(), nil)
	if w.Code != http.StatusCreated {
		t.Fatalf("status = %d, want %d", w.Code, http.StatusCreated)
	}

	// Verify the order was linked to the user
	var order models.Order
	db.First(&order)
	if order.UserID == nil {
		t.Error("expected order to be linked to user")
	}
	if *order.UserID != userID {
		t.Errorf("UserID = %v, want %v", *order.UserID, userID)
	}
}

func TestGetOrderHistory_Success(t *testing.T) {
	db := setupTestDB(t)
	h := NewOrderHandler(db)
	userID := uuid.New()

	// Seed orders
	for i := 0; i < 3; i++ {
		db.Create(&models.Order{
			OrderID:       utils.GenerateOrderID(),
			UserID:        &userID,
			CustomerName:  "Test",
			CustomerEmail: "test@example.com",
			CustomerPhone: "1234567890",
			Address:       datatypes.JSON([]byte(`{"line1":"123 St"}`)),
			Items:         datatypes.JSON([]byte(`[{"name":"item"}]`)),
			TotalAmount:   1000,
			PaymentMethod: "cod",
		})
	}

	r := setupTestRouter()
	r.GET("/orders/history", func(c *gin.Context) {
		c.Set("userID", userID)
		h.GetOrderHistory(c)
	})

	w := performJSONRequest(r, "GET", "/orders/history", nil, nil)
	if w.Code != http.StatusOK {
		t.Fatalf("status = %d, want %d", w.Code, http.StatusOK)
	}

	var resp utils.ApiResponse
	json.Unmarshal(w.Body.Bytes(), &resp)
	orders := resp.Data.([]interface{})
	if len(orders) != 3 {
		t.Errorf("orders count = %d, want 3", len(orders))
	}
}

func TestGetOrderHistory_EmptyHistory(t *testing.T) {
	db := setupTestDB(t)
	h := NewOrderHandler(db)
	userID := uuid.New()

	r := setupTestRouter()
	r.GET("/orders/history", func(c *gin.Context) {
		c.Set("userID", userID)
		h.GetOrderHistory(c)
	})

	w := performJSONRequest(r, "GET", "/orders/history", nil, nil)
	if w.Code != http.StatusOK {
		t.Fatalf("status = %d, want %d", w.Code, http.StatusOK)
	}

	var resp utils.ApiResponse
	json.Unmarshal(w.Body.Bytes(), &resp)
	orders := resp.Data.([]interface{})
	if len(orders) != 0 {
		t.Errorf("orders count = %d, want 0", len(orders))
	}
}

func TestGetOrderHistory_Unauthenticated(t *testing.T) {
	db := setupTestDB(t)
	h := NewOrderHandler(db)

	r := setupTestRouter()
	r.GET("/orders/history", h.GetOrderHistory)

	w := performJSONRequest(r, "GET", "/orders/history", nil, nil)
	if w.Code != http.StatusUnauthorized {
		t.Errorf("status = %d, want %d", w.Code, http.StatusUnauthorized)
	}
}
