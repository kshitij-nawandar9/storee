package handlers

import (
	"encoding/json"
	"net/http"
	"testing"

	"storee/backend/models"
	"storee/backend/services"

	"gorm.io/datatypes"
)

// Razorpay confirms a payment twice — VerifyPayment from the browser and the
// payment.captured webhook from Razorpay. The customer must get one message.
func TestPaymentConfirmedTwice_QueuesOneNotificationPerRecipient(t *testing.T) {
	h, _ := newTestRazorpayHandler(t, "")
	h.Notifier = testNotifier()

	order := notifiableOrder("NOTIFYPAID", "pending")
	order.RazorpayOrderID = "order_notify1"
	h.DB.Create(&order)

	r := setupTestRouter()
	r.POST("/razorpay/verify-payment", h.VerifyPayment)
	r.POST("/razorpay/webhook", h.HandleWebhook)

	verifyBody, _ := json.Marshal(map[string]string{
		"order_id":   "order_notify1",
		"payment_id": "pay_notify1",
		"signature":  computeHMAC("order_notify1|pay_notify1", "rzp_test_secret"),
	})
	if w := performJSONRequest(r, "POST", "/razorpay/verify-payment", verifyBody, nil); w.Code != http.StatusOK {
		t.Fatalf("verify-payment: status = %d, body: %s", w.Code, w.Body.String())
	}

	hookBody, sig := webhookBody("payment.captured", "order_notify1", "pay_notify1", "captured")
	if w := performJSONRequest(r, "POST", "/razorpay/webhook", hookBody, map[string]string{
		"X-Razorpay-Signature": sig,
	}); w.Code != http.StatusOK {
		t.Fatalf("webhook: status = %d, body: %s", w.Code, w.Body.String())
	}

	rows := queuedNotifications(t, h.DB, order.OrderID)
	if len(rows) != 2 {
		t.Fatalf("queued %d notifications after a double confirmation, want 2 (one admin, one customer)", len(rows))
	}
	for _, row := range rows {
		if row.Event != services.EventPaymentReceived {
			t.Errorf("event = %q, want %q", row.Event, services.EventPaymentReceived)
		}
	}
}

// The handlers only enqueue; these tests pin the wiring — which lifecycle
// transitions produce outbox rows, and which deliberately produce none.

func TestCreateCODOrder_QueuesOrderPlacedNotifications(t *testing.T) {
	db := setupTestDB(t)
	h := NewOrderHandler(db).WithNotifier(testNotifier())

	r := setupTestRouter()
	r.POST("/orders/cod", h.CreateCODOrder)

	w := performJSONRequest(r, "POST", "/orders/cod", validCODOrderBody(), idempotencyHeaders("cod-notify"))
	if w.Code != http.StatusCreated {
		t.Fatalf("status = %d, want %d, body: %s", w.Code, http.StatusCreated, w.Body.String())
	}

	var rows []models.Notification
	db.Order("audience asc").Find(&rows)
	if len(rows) != 2 {
		t.Fatalf("queued %d notifications, want 2 (admin + customer)", len(rows))
	}
	for _, row := range rows {
		if row.Event != services.EventOrderPlaced {
			t.Errorf("event = %q, want %q", row.Event, services.EventOrderPlaced)
		}
		if row.Status != models.NotificationQueued {
			t.Errorf("status = %q, want queued", row.Status)
		}
	}
	if rows[0].Audience != services.AudienceAdmin || rows[1].Audience != services.AudienceCustomer {
		t.Errorf("audiences = %q/%q", rows[0].Audience, rows[1].Audience)
	}
}

// Without a notifier (unconfigured deploy) the handler must still succeed.
func TestCreateCODOrder_WithoutNotifierStillSucceeds(t *testing.T) {
	db := setupTestDB(t)
	h := NewOrderHandler(db)

	r := setupTestRouter()
	r.POST("/orders/cod", h.CreateCODOrder)

	w := performJSONRequest(r, "POST", "/orders/cod", validCODOrderBody(), idempotencyHeaders("cod-no-notifier"))
	if w.Code != http.StatusCreated {
		t.Fatalf("status = %d, want %d, body: %s", w.Code, http.StatusCreated, w.Body.String())
	}

	var count int64
	db.Model(&models.Notification{}).Count(&count)
	if count != 0 {
		t.Errorf("queued %d notifications without a notifier, want 0", count)
	}
}

func notifiableOrder(orderID, status string) models.Order {
	return models.Order{
		OrderID: orderID, CustomerName: "Test Customer", CustomerEmail: "t@t.com",
		CustomerPhone: "9876543210", Address: datatypes.JSON([]byte(`{}`)), Items: datatypes.JSON([]byte(`[]`)),
		TotalAmount: 129900, PaymentMethod: "razorpay", Status: status,
	}
}

func TestUpdateOrderStatus_QueuesPerTransition(t *testing.T) {
	tests := []struct {
		name      string
		from      string
		to        string
		wantEvent string // "" means no notification at all
	}{
		{"processing is internal", "paid", "processing", ""},
		{"shipped notifies the customer", "processing", "shipped", services.EventOrderShipped},
		{"delivered notifies the customer", "shipped", "delivered", services.EventOrderDelivered},
		{"cancelled notifies both", "paid", "cancelled", services.EventOrderCancelled},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			db := setupTestDB(t)
			h := NewAdminHandler(db).WithNotifier(testNotifier())

			order := notifiableOrder("NOTIFY"+tt.to, tt.from)
			db.Create(&order)

			r := setupTestRouter()
			r.PUT("/admin/orders/:id/status", h.UpdateOrderStatus)

			body, _ := json.Marshal(map[string]string{"status": tt.to})
			w := performJSONRequest(r, "PUT", "/admin/orders/"+order.ID.String()+"/status", body, nil)
			if w.Code != http.StatusOK {
				t.Fatalf("status = %d, want %d, body: %s", w.Code, http.StatusOK, w.Body.String())
			}

			rows := queuedNotifications(t, db, order.OrderID)
			if tt.wantEvent == "" {
				if len(rows) != 0 {
					t.Fatalf("queued %d notifications for %q, want 0", len(rows), tt.to)
				}
				return
			}
			if len(rows) == 0 {
				t.Fatalf("queued no notifications for %q, want %q", tt.to, tt.wantEvent)
			}
			for _, row := range rows {
				if row.Event != tt.wantEvent {
					t.Errorf("event = %q, want %q", row.Event, tt.wantEvent)
				}
			}
		})
	}
}

// A rejected transition must not message the customer about a status the order
// never reached.
func TestUpdateOrderStatus_InvalidTransitionQueuesNothing(t *testing.T) {
	db := setupTestDB(t)
	h := NewAdminHandler(db).WithNotifier(testNotifier())

	order := notifiableOrder("NOTIFYBAD", "pending")
	db.Create(&order)

	r := setupTestRouter()
	r.PUT("/admin/orders/:id/status", h.UpdateOrderStatus)

	body, _ := json.Marshal(map[string]string{"status": "delivered"})
	w := performJSONRequest(r, "PUT", "/admin/orders/"+order.ID.String()+"/status", body, nil)
	if w.Code != http.StatusBadRequest {
		t.Fatalf("status = %d, want %d", w.Code, http.StatusBadRequest)
	}

	if rows := queuedNotifications(t, db, order.OrderID); len(rows) != 0 {
		t.Errorf("queued %d notifications for a rejected transition, want 0", len(rows))
	}
}
