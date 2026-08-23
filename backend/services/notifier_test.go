package services

import (
	"encoding/json"
	"testing"

	"storee/backend/models"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

func setupNotifierDB(t *testing.T) *gorm.DB {
	t.Helper()
	db, err := gorm.Open(sqlite.Open(":memory:"), &gorm.Config{Logger: logger.Discard})
	if err != nil {
		t.Fatalf("failed to open test db: %v", err)
	}
	if err := db.AutoMigrate(&models.Notification{}); err != nil {
		t.Fatalf("failed to migrate: %v", err)
	}
	return db
}

func testNotifier(adminNumbers ...string) *Notifier {
	return NewNotifier(NewWhatsAppClient("123456", "token", ""), adminNumbers, "en", true)
}

func testOrder() *models.Order {
	return &models.Order{
		OrderID:       "AB12CD34EF",
		CustomerName:  "Kshitij Nawandar",
		CustomerEmail: "customer@example.com",
		CustomerPhone: "+91 98765 43210",
		TotalAmount:   129900,
		PaymentMethod: "cod",
		Status:        "pending",
	}
}

func payloadOf(t *testing.T, n models.Notification) MessagePayload {
	t.Helper()
	var p MessagePayload
	if err := json.Unmarshal(n.Payload, &p); err != nil {
		t.Fatalf("failed to unmarshal payload: %v", err)
	}
	return p
}

func TestNotifierEnqueueQueuesCustomerAndAdmin(t *testing.T) {
	db := setupNotifierDB(t)
	testNotifier("9123456789").Enqueue(db, testOrder(), EventOrderPlaced)

	var rows []models.Notification
	db.Order("audience asc").Find(&rows)
	if len(rows) != 2 {
		t.Fatalf("queued %d notifications, want 2", len(rows))
	}

	admin, customer := rows[0], rows[1]
	if admin.Audience != AudienceAdmin || admin.Recipient != "919123456789" {
		t.Errorf("admin row = %+v", admin)
	}
	if customer.Audience != AudienceCustomer || customer.Recipient != "919876543210" {
		t.Errorf("customer row = %+v", customer)
	}
	if customer.Status != models.NotificationQueued {
		t.Errorf("status = %q, want queued", customer.Status)
	}

	p := payloadOf(t, customer)
	if p.Template != templateOrderPlaced {
		t.Errorf("template = %q, want %q", p.Template, templateOrderPlaced)
	}
	want := []string{"Kshitij", "AB12CD34EF", "1,299"}
	if len(p.Params) != len(want) {
		t.Fatalf("params = %v, want %v", p.Params, want)
	}
	for i := range want {
		if p.Params[i] != want[i] {
			t.Errorf("param %d = %q, want %q", i, p.Params[i], want[i])
		}
	}
}

// VerifyPayment and the Razorpay webhook both mark an order paid; the customer
// must still only get one message.
func TestNotifierEnqueueIsIdempotentPerEvent(t *testing.T) {
	db := setupNotifierDB(t)
	n := testNotifier("9123456789")
	order := testOrder()

	n.Enqueue(db, order, EventPaymentReceived)
	n.Enqueue(db, order, EventPaymentReceived)

	var count int64
	db.Model(&models.Notification{}).Count(&count)
	if count != 2 {
		t.Fatalf("queued %d notifications after a duplicate enqueue, want 2", count)
	}
}

func TestNotifierEnqueueSkipsUnusablePhone(t *testing.T) {
	db := setupNotifierDB(t)
	order := testOrder()
	order.CustomerPhone = "not a phone"

	testNotifier().Enqueue(db, order, EventOrderPlaced)

	var count int64
	db.Model(&models.Notification{}).Count(&count)
	if count != 0 {
		t.Errorf("queued %d notifications for an unusable phone, want 0", count)
	}
}

// Fulfilment steps the admin performed themselves shouldn't ping the admin.
func TestNotifierEnqueueSkipsAdminForFulfilmentEvents(t *testing.T) {
	db := setupNotifierDB(t)
	testNotifier("9123456789").Enqueue(db, testOrder(), EventOrderDelivered)

	var rows []models.Notification
	db.Find(&rows)
	if len(rows) != 1 {
		t.Fatalf("queued %d notifications, want 1 (customer only)", len(rows))
	}
	if rows[0].Audience != AudienceCustomer {
		t.Errorf("audience = %q, want customer", rows[0].Audience)
	}
}

func TestNotifierShippedFallsBackWhenTrackingIsPending(t *testing.T) {
	db := setupNotifierDB(t)
	testNotifier().Enqueue(db, testOrder(), EventOrderShipped)

	var row models.Notification
	db.First(&row)
	p := payloadOf(t, row)
	if p.Params[2] != "our courier partner" || p.Params[3] != "will be shared shortly" {
		t.Errorf("params = %v, want courier/AWB fallbacks", p.Params)
	}
}

func TestNotifierShippedUsesCourierAndAWBWhenPresent(t *testing.T) {
	db := setupNotifierDB(t)
	order := testOrder()
	order.CourierName = "Delhivery"
	order.AWBCode = "1234567890"

	testNotifier().Enqueue(db, order, EventOrderShipped)

	var row models.Notification
	db.First(&row)
	p := payloadOf(t, row)
	if p.Params[2] != "Delhivery" || p.Params[3] != "1234567890" {
		t.Errorf("params = %v, want the real courier and AWB", p.Params)
	}
}

func TestNotifierInactiveWhenDisabledOrUnconfigured(t *testing.T) {
	cases := map[string]*Notifier{
		"nil notifier": nil,
		"disabled":     NewNotifier(NewWhatsAppClient("123", "token", ""), nil, "en", false),
		"no creds":     NewNotifier(NewWhatsAppClient("", "", ""), nil, "en", true),
	}

	for name, n := range cases {
		t.Run(name, func(t *testing.T) {
			if n.Active() {
				t.Fatal("Active() = true, want false")
			}
			db := setupNotifierDB(t)
			n.Enqueue(db, testOrder(), EventOrderPlaced)

			var count int64
			db.Model(&models.Notification{}).Count(&count)
			if count != 0 {
				t.Errorf("queued %d notifications while inactive, want 0", count)
			}
		})
	}
}

func TestNotifierIgnoresUnparseableAdminNumber(t *testing.T) {
	n := testNotifier("9123456789", "garbage")
	if len(n.AdminNumbers) != 1 || n.AdminNumbers[0] != "919123456789" {
		t.Errorf("AdminNumbers = %v, want just the valid one normalized", n.AdminNumbers)
	}
}

func TestCustomerFirstName(t *testing.T) {
	tests := map[string]string{
		"Kshitij Nawandar": "Kshitij",
		"Kshitij":          "Kshitij",
		"  ":               "there",
		"":                 "there",
	}
	for in, want := range tests {
		if got := customerFirstName(in); got != want {
			t.Errorf("customerFirstName(%q) = %q, want %q", in, got, want)
		}
	}
}
