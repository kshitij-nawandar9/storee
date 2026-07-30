package handlers

import (
	"strings"
	"testing"

	"storee/backend/models"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

func setupChatTestDB(t *testing.T) *gorm.DB {
	t.Helper()
	db, err := gorm.Open(sqlite.Open(":memory:"), &gorm.Config{})
	if err != nil {
		t.Fatalf("failed to open test db: %v", err)
	}
	if err := db.AutoMigrate(&models.Product{}, &models.ProductImage{}, &models.Order{}); err != nil {
		t.Fatalf("failed to migrate: %v", err)
	}
	return db
}

func TestSearchProducts(t *testing.T) {
	db := setupChatTestDB(t)
	h := &ChatHandler{DB: db}

	zero := 0
	products := []models.Product{
		{Name: "Rakhi Hamper Deluxe", Slug: "rakhi-hamper-deluxe", Category: "Rakhi Hampers", BasePrice: 129900, IsActive: true},
		{Name: "Sunglasses Pouch", Slug: "sunglasses-pouch", Category: "pouch", BasePrice: 39900, IsActive: true, Stock: &zero},
		{Name: "Hidden Hamper", Slug: "hidden-hamper", Category: "Rakhi Hampers", BasePrice: 99900, IsActive: false},
	}
	for i := range products {
		if err := db.Create(&products[i]).Error; err != nil {
			t.Fatalf("failed to seed product: %v", err)
		}
	}
	// gorm skips zero-value fields with a column default on insert, so
	// deactivate explicitly.
	if err := db.Model(&products[2]).Update("is_active", false).Error; err != nil {
		t.Fatalf("failed to deactivate product: %v", err)
	}

	out, err := h.searchProducts("hamper")
	if err != nil {
		t.Fatalf("searchProducts() error = %v", err)
	}
	if !strings.Contains(out, "Rakhi Hamper Deluxe") {
		t.Errorf("expected match in results, got %s", out)
	}
	if !strings.Contains(out, `"priceRupees":1299`) {
		t.Errorf("expected price in rupees, got %s", out)
	}
	if strings.Contains(out, "Hidden Hamper") {
		t.Errorf("inactive product should be excluded, got %s", out)
	}

	out, err = h.searchProducts("pouch")
	if err != nil {
		t.Fatalf("searchProducts() error = %v", err)
	}
	if !strings.Contains(out, `"inStock":false`) {
		t.Errorf("zero-stock product should report inStock false, got %s", out)
	}

	out, err = h.searchProducts("does-not-exist-xyz")
	if err != nil {
		t.Fatalf("searchProducts() error = %v", err)
	}
	if out != "No matching products found." {
		t.Errorf("expected no-results message, got %s", out)
	}
}

func TestGetOrderStatus(t *testing.T) {
	db := setupChatTestDB(t)
	h := &ChatHandler{DB: db}

	order := models.Order{
		OrderID:       "YBOV3E90AO",
		CustomerName:  "Kshitij Nawandar",
		CustomerEmail: "customer@example.com",
		CustomerPhone: "9999999999",
		Address:       []byte(`{"line1":"1 Main St","city":"Pune","state":"MH","pincode":"411001"}`),
		Items:         []byte(`[{"name":"Rakhi Hamper","quantity":2,"price":64900}]`),
		TotalAmount:   129800,
		Status:        "shipped",
		PaymentMethod: "cod",
		AWBCode:       "AWB123",
		CourierName:   "Delhivery",
	}
	if err := db.Create(&order).Error; err != nil {
		t.Fatalf("failed to seed order: %v", err)
	}

	// Correct order ID + email (case-insensitive, lowercase order id accepted)
	out, err := h.getOrderStatus("ybov3e90ao", "Customer@Example.com")
	if err != nil {
		t.Fatalf("getOrderStatus() error = %v", err)
	}
	for _, want := range []string{`"status":"shipped"`, `"totalRupees":1298`, "Rakhi Hamper x2", "AWB123", "Delhivery"} {
		if !strings.Contains(out, want) {
			t.Errorf("expected %s in result, got %s", want, out)
		}
	}

	// Wrong email must not leak the order — and must match the wrong-ID reply
	wrongEmail, err := h.getOrderStatus("YBOV3E90AO", "attacker@example.com")
	if err != nil {
		t.Fatalf("getOrderStatus() error = %v", err)
	}
	if strings.Contains(wrongEmail, "shipped") || strings.Contains(wrongEmail, "AWB123") {
		t.Errorf("wrong email leaked order details: %s", wrongEmail)
	}
	wrongID, err := h.getOrderStatus("NOSUCHORDR", "customer@example.com")
	if err != nil {
		t.Fatalf("getOrderStatus() error = %v", err)
	}
	if wrongEmail != wrongID {
		t.Errorf("wrong-email and wrong-id replies should be identical: %q vs %q", wrongEmail, wrongID)
	}
}

func TestValidateChatMessages(t *testing.T) {
	// Valid conversation
	msgs, err := validateChatMessages([]ChatMessage{
		{Role: "user", Content: "hi"},
		{Role: "assistant", Content: "hello"},
		{Role: "user", Content: "do you have hampers?"},
	})
	if err != nil {
		t.Fatalf("validateChatMessages() error = %v", err)
	}
	if len(msgs) != 3 {
		t.Errorf("expected 3 messages, got %d", len(msgs))
	}

	// Empty, wrong last role, bad role, oversized
	if _, err := validateChatMessages(nil); err == nil {
		t.Error("expected error for empty messages")
	}
	if _, err := validateChatMessages([]ChatMessage{{Role: "assistant", Content: "hi"}}); err == nil {
		t.Error("expected error when last message is not from user")
	}
	if _, err := validateChatMessages([]ChatMessage{{Role: "system", Content: "hi"}}); err == nil {
		t.Error("expected error for invalid role")
	}
	if _, err := validateChatMessages([]ChatMessage{{Role: "user", Content: strings.Repeat("a", maxChatMessageLen+1)}}); err == nil {
		t.Error("expected error for oversized message")
	}

	// Over-long history is trimmed to the most recent messages
	long := make([]ChatMessage, 0, maxChatMessages+6)
	for i := 0; i < maxChatMessages+6; i += 2 {
		long = append(long, ChatMessage{Role: "user", Content: "q"}, ChatMessage{Role: "assistant", Content: "a"})
	}
	long = append(long, ChatMessage{Role: "user", Content: "final"})
	msgs, err = validateChatMessages(long)
	if err != nil {
		t.Fatalf("validateChatMessages() error = %v", err)
	}
	if len(msgs) > maxChatMessages {
		t.Errorf("history should be trimmed to %d, got %d", maxChatMessages, len(msgs))
	}
	last := msgs[len(msgs)-1]
	if last.Role != "user" || last.Content[0].Text != "final" {
		t.Errorf("latest message should be preserved, got %+v", last)
	}
}
