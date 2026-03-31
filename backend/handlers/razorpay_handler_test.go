package handlers

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"

	"storee/backend/config"
	"storee/backend/models"
	"storee/backend/services"
	"storee/backend/utils"

	"github.com/google/uuid"
	"gorm.io/datatypes"
)

func newTestRazorpayHandler(t *testing.T, razorpayURL string) (*RazorpayHandler, *httptest.ResponseRecorder) {
	t.Helper()
	db := setupTestDB(t)
	cfg := &config.Config{
		RazorpayKeyID:  "rzp_test_key",
		RazorpaySecret: "rzp_test_secret",
	}
	client := services.NewRazorpayClient(cfg.RazorpayKeyID, cfg.RazorpaySecret)
	if razorpayURL != "" {
		client.BaseURL = razorpayURL
	}
	h := &RazorpayHandler{DB: db, Config: cfg, RazorpayClient: client}
	return h, httptest.NewRecorder()
}

func mockRazorpayServer(t *testing.T) *httptest.Server {
	t.Helper()
	return httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		fmt.Fprintf(w, `{"id":"order_test123","entity":"order","amount":50000,"currency":"INR","receipt":"receipt_ABC","status":"created","created_at":1234567890}`)
	}))
}

func validCreateOrderBody() []byte {
	body, _ := json.Marshal(map[string]interface{}{
		"amount": 50000,
		"items":  []map[string]interface{}{{"name": "Test Item", "qty": 1}},
		"customer": map[string]string{
			"name":  "John Doe",
			"email": "john@example.com",
			"phone": "9876543210",
		},
		"address": map[string]string{
			"line1":   "123 Test St",
			"line2":   "",
			"city":    "Mumbai",
			"state":   "Maharashtra",
			"pincode": "400001",
		},
	})
	return body
}

func computeHMAC(message, secret string) string {
	mac := hmac.New(sha256.New, []byte(secret))
	mac.Write([]byte(message))
	return hex.EncodeToString(mac.Sum(nil))
}

// --- CreateOrder Tests ---

func TestCreateOrder_Success(t *testing.T) {
	server := mockRazorpayServer(t)
	defer server.Close()

	h, _ := newTestRazorpayHandler(t, server.URL)

	r := setupTestRouter()
	r.POST("/razorpay/create-order", h.CreateOrder)

	w := performJSONRequest(r, "POST", "/razorpay/create-order", validCreateOrderBody(), nil)
	if w.Code != http.StatusCreated {
		t.Fatalf("status = %d, want %d, body: %s", w.Code, http.StatusCreated, w.Body.String())
	}

	var resp utils.ApiResponse
	json.Unmarshal(w.Body.Bytes(), &resp)
	if !resp.Success {
		t.Error("expected success=true")
	}

	data := resp.Data.(map[string]interface{})
	order := data["order"].(map[string]interface{})
	if order["razorpay_id"] != "order_test123" {
		t.Errorf("razorpay_id = %v, want order_test123", order["razorpay_id"])
	}
	if order["key_id"] != "rzp_test_key" {
		t.Errorf("key_id = %v, want rzp_test_key", order["key_id"])
	}
}

func TestCreateOrder_InvalidBody(t *testing.T) {
	server := mockRazorpayServer(t)
	defer server.Close()

	h, _ := newTestRazorpayHandler(t, server.URL)

	r := setupTestRouter()
	r.POST("/razorpay/create-order", h.CreateOrder)

	w := performJSONRequest(r, "POST", "/razorpay/create-order", []byte(`{}`), nil)
	if w.Code != http.StatusBadRequest {
		t.Errorf("status = %d, want %d", w.Code, http.StatusBadRequest)
	}
}

func TestCreateOrder_RazorpayAPIError(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusBadRequest)
		fmt.Fprintf(w, `{"error":"bad request"}`)
	}))
	defer server.Close()

	h, _ := newTestRazorpayHandler(t, server.URL)

	r := setupTestRouter()
	r.POST("/razorpay/create-order", h.CreateOrder)

	w := performJSONRequest(r, "POST", "/razorpay/create-order", validCreateOrderBody(), nil)
	if w.Code != http.StatusInternalServerError {
		t.Errorf("status = %d, want %d", w.Code, http.StatusInternalServerError)
	}
}

// --- VerifyPayment Tests ---

func TestVerifyPayment_Success(t *testing.T) {
	h, _ := newTestRazorpayHandler(t, "")

	// Seed an order with razorpay order ID
	h.DB.Create(&models.Order{
		OrderID: "VERIFY0001", RazorpayOrderID: "order_rpay123",
		CustomerName: "Test", CustomerEmail: "t@t.com", CustomerPhone: "1234567890",
		Address: datatypes.JSON([]byte(`{}`)), Items: datatypes.JSON([]byte(`[]`)),
		TotalAmount: 5000, PaymentMethod: "razorpay", Status: "pending",
	})

	sig := computeHMAC("order_rpay123|pay_123", "rzp_test_secret")

	r := setupTestRouter()
	r.POST("/razorpay/verify-payment", h.VerifyPayment)

	body, _ := json.Marshal(map[string]string{
		"order_id":   "order_rpay123",
		"payment_id": "pay_123",
		"signature":  sig,
	})
	w := performJSONRequest(r, "POST", "/razorpay/verify-payment", body, nil)
	if w.Code != http.StatusOK {
		t.Fatalf("status = %d, want %d, body: %s", w.Code, http.StatusOK, w.Body.String())
	}

	// Verify order status updated
	var order models.Order
	h.DB.Where("razorpay_order_id = ?", "order_rpay123").First(&order)
	if order.Status != "paid" {
		t.Errorf("order status = %q, want paid", order.Status)
	}
	if order.PaymentID != "pay_123" {
		t.Errorf("paymentID = %q, want pay_123", order.PaymentID)
	}
}

func TestVerifyPayment_InvalidSignature(t *testing.T) {
	h, _ := newTestRazorpayHandler(t, "")

	r := setupTestRouter()
	r.POST("/razorpay/verify-payment", h.VerifyPayment)

	body, _ := json.Marshal(map[string]string{
		"order_id":   "order_rpay123",
		"payment_id": "pay_123",
		"signature":  "invalidsignature",
	})
	w := performJSONRequest(r, "POST", "/razorpay/verify-payment", body, nil)
	if w.Code != http.StatusBadRequest {
		t.Errorf("status = %d, want %d", w.Code, http.StatusBadRequest)
	}
}

func TestVerifyPayment_OrderNotFound(t *testing.T) {
	h, _ := newTestRazorpayHandler(t, "")

	sig := computeHMAC("order_nonexist|pay_123", "rzp_test_secret")

	r := setupTestRouter()
	r.POST("/razorpay/verify-payment", h.VerifyPayment)

	body, _ := json.Marshal(map[string]string{
		"order_id":   "order_nonexist",
		"payment_id": "pay_123",
		"signature":  sig,
	})
	w := performJSONRequest(r, "POST", "/razorpay/verify-payment", body, nil)
	if w.Code != http.StatusNotFound {
		t.Errorf("status = %d, want %d", w.Code, http.StatusNotFound)
	}
}

// --- Webhook Tests ---

func webhookBody(event, razorpayOrderID, paymentID, paymentStatus string) ([]byte, string) {
	payload := map[string]interface{}{
		"event": event,
		"payload": map[string]interface{}{
			"payment": map[string]interface{}{
				"id":     paymentID,
				"status": paymentStatus,
			},
			"order": map[string]interface{}{
				"id": razorpayOrderID,
			},
		},
	}
	body, _ := json.Marshal(payload)
	sig := computeHMAC(string(body), "rzp_test_secret")
	return body, sig
}

func TestHandleWebhook_PaymentCaptured(t *testing.T) {
	h, _ := newTestRazorpayHandler(t, "")

	h.DB.Create(&models.Order{
		OrderID: "WEBHOOK001", RazorpayOrderID: "order_wh1",
		CustomerName: "Test", CustomerEmail: "t@t.com", CustomerPhone: "1234567890",
		Address: datatypes.JSON([]byte(`{}`)), Items: datatypes.JSON([]byte(`[]`)),
		TotalAmount: 5000, PaymentMethod: "razorpay", Status: "pending",
	})

	body, sig := webhookBody("payment.captured", "order_wh1", "pay_wh1", "captured")

	r := setupTestRouter()
	r.POST("/razorpay/webhook", h.HandleWebhook)

	w := performJSONRequest(r, "POST", "/razorpay/webhook", body, map[string]string{
		"X-Razorpay-Signature": sig,
	})
	if w.Code != http.StatusOK {
		t.Fatalf("status = %d, want %d, body: %s", w.Code, http.StatusOK, w.Body.String())
	}

	var order models.Order
	h.DB.Where("razorpay_order_id = ?", "order_wh1").First(&order)
	if order.Status != "paid" {
		t.Errorf("status = %q, want paid", order.Status)
	}
}

func TestHandleWebhook_PaymentFailed(t *testing.T) {
	h, _ := newTestRazorpayHandler(t, "")

	h.DB.Create(&models.Order{
		ID:      uuid.New(),
		OrderID: "WEBHOOK002", RazorpayOrderID: "order_wh2",
		CustomerName: "Test", CustomerEmail: "t@t.com", CustomerPhone: "1234567890",
		Address: datatypes.JSON([]byte(`{}`)), Items: datatypes.JSON([]byte(`[]`)),
		TotalAmount: 5000, PaymentMethod: "razorpay", Status: "pending",
	})

	body, sig := webhookBody("payment.failed", "order_wh2", "pay_wh2", "failed")

	r := setupTestRouter()
	r.POST("/razorpay/webhook", h.HandleWebhook)

	w := performJSONRequest(r, "POST", "/razorpay/webhook", body, map[string]string{
		"X-Razorpay-Signature": sig,
	})
	if w.Code != http.StatusOK {
		t.Fatalf("status = %d, want %d", w.Code, http.StatusOK)
	}

	var order models.Order
	h.DB.Where("razorpay_order_id = ?", "order_wh2").First(&order)
	if order.Status != "cancelled" {
		t.Errorf("status = %q, want cancelled", order.Status)
	}
}

func TestHandleWebhook_InvalidSignature(t *testing.T) {
	h, _ := newTestRazorpayHandler(t, "")

	r := setupTestRouter()
	r.POST("/razorpay/webhook", h.HandleWebhook)

	body, _ := webhookBody("payment.captured", "order_x", "pay_x", "captured")
	w := performJSONRequest(r, "POST", "/razorpay/webhook", body, map[string]string{
		"X-Razorpay-Signature": "invalidsig",
	})
	if w.Code != http.StatusBadRequest {
		t.Errorf("status = %d, want %d", w.Code, http.StatusBadRequest)
	}
}

func TestHandleWebhook_MissingSignature(t *testing.T) {
	h, _ := newTestRazorpayHandler(t, "")

	r := setupTestRouter()
	r.POST("/razorpay/webhook", h.HandleWebhook)

	w := performJSONRequest(r, "POST", "/razorpay/webhook", []byte(`{}`), nil)
	if w.Code != http.StatusBadRequest {
		t.Errorf("status = %d, want %d", w.Code, http.StatusBadRequest)
	}
}
