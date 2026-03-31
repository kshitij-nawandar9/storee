package models

import (
	"testing"

	"github.com/google/uuid"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

func setupHooksTestDB(t *testing.T) *gorm.DB {
	t.Helper()
	db, err := gorm.Open(sqlite.Open(":memory:"), &gorm.Config{})
	if err != nil {
		t.Fatalf("failed to open test db: %v", err)
	}
	if err := db.AutoMigrate(&User{}, &Product{}, &ProductImage{}, &Order{}); err != nil {
		t.Fatalf("failed to migrate: %v", err)
	}
	return db
}

func TestUser_BeforeCreate_GeneratesUUID(t *testing.T) {
	db := setupHooksTestDB(t)
	user := User{
		GoogleID: "google-123",
		Email:    "test@example.com",
		Name:     "Test User",
	}
	if err := db.Create(&user).Error; err != nil {
		t.Fatalf("Create() error = %v", err)
	}
	if user.ID == uuid.Nil {
		t.Error("User.ID should be generated, got uuid.Nil")
	}
}

func TestUser_BeforeCreate_PreservesExistingUUID(t *testing.T) {
	db := setupHooksTestDB(t)
	existingID := uuid.New()
	user := User{
		ID:       existingID,
		GoogleID: "google-456",
		Email:    "existing@example.com",
		Name:     "Existing User",
	}
	if err := db.Create(&user).Error; err != nil {
		t.Fatalf("Create() error = %v", err)
	}
	if user.ID != existingID {
		t.Errorf("User.ID = %v, want %v", user.ID, existingID)
	}
}

func TestProduct_BeforeCreate_GeneratesUUID(t *testing.T) {
	db := setupHooksTestDB(t)
	product := Product{
		Name:      "Test Product",
		Slug:      "test-product",
		BasePrice: 1000,
		Category:  "test",
	}
	if err := db.Create(&product).Error; err != nil {
		t.Fatalf("Create() error = %v", err)
	}
	if product.ID == uuid.Nil {
		t.Error("Product.ID should be generated, got uuid.Nil")
	}
}

func TestProduct_BeforeCreate_PreservesExistingUUID(t *testing.T) {
	db := setupHooksTestDB(t)
	existingID := uuid.New()
	product := Product{
		ID:        existingID,
		Name:      "Test Product 2",
		Slug:      "test-product-2",
		BasePrice: 2000,
		Category:  "test",
	}
	if err := db.Create(&product).Error; err != nil {
		t.Fatalf("Create() error = %v", err)
	}
	if product.ID != existingID {
		t.Errorf("Product.ID = %v, want %v", product.ID, existingID)
	}
}

func TestProductImage_BeforeCreate_GeneratesUUID(t *testing.T) {
	db := setupHooksTestDB(t)
	// Create a product first
	product := Product{Name: "P", Slug: "p-img-test", BasePrice: 100, Category: "test"}
	db.Create(&product)

	img := ProductImage{
		ProductID: product.ID,
		URL:       "https://example.com/img.jpg",
	}
	if err := db.Create(&img).Error; err != nil {
		t.Fatalf("Create() error = %v", err)
	}
	if img.ID == uuid.Nil {
		t.Error("ProductImage.ID should be generated, got uuid.Nil")
	}
}

func TestOrder_BeforeCreate_GeneratesUUID(t *testing.T) {
	db := setupHooksTestDB(t)
	order := Order{
		OrderID:       "ABCDE12345",
		CustomerName:  "John",
		CustomerEmail: "john@example.com",
		CustomerPhone: "1234567890",
		Address:       []byte(`{"line1":"123 St"}`),
		Items:         []byte(`[{"name":"item1"}]`),
		TotalAmount:   5000,
		PaymentMethod: "cod",
	}
	if err := db.Create(&order).Error; err != nil {
		t.Fatalf("Create() error = %v", err)
	}
	if order.ID == uuid.Nil {
		t.Error("Order.ID should be generated, got uuid.Nil")
	}
}

func TestOrder_BeforeCreate_PreservesExistingUUID(t *testing.T) {
	db := setupHooksTestDB(t)
	existingID := uuid.New()
	order := Order{
		ID:            existingID,
		OrderID:       "FGHIJ67890",
		CustomerName:  "Jane",
		CustomerEmail: "jane@example.com",
		CustomerPhone: "0987654321",
		Address:       []byte(`{"line1":"456 Ave"}`),
		Items:         []byte(`[{"name":"item2"}]`),
		TotalAmount:   3000,
		PaymentMethod: "razorpay",
	}
	if err := db.Create(&order).Error; err != nil {
		t.Fatalf("Create() error = %v", err)
	}
	if order.ID != existingID {
		t.Errorf("Order.ID = %v, want %v", order.ID, existingID)
	}
}
