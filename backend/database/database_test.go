package database

import (
	"testing"

	"storee/backend/models"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

func setupBackfillDB(t *testing.T) *gorm.DB {
	t.Helper()
	db, err := gorm.Open(sqlite.Open(":memory:"), &gorm.Config{})
	if err != nil {
		t.Fatalf("failed to open test db: %v", err)
	}
	if err := db.AutoMigrate(&models.Order{}); err != nil {
		t.Fatalf("failed to migrate: %v", err)
	}
	return db
}

func newOrder(orderID, status string) models.Order {
	return models.Order{
		OrderID: orderID, CustomerName: "Test", CustomerEmail: "t@t.com",
		CustomerPhone: "1234567890", Address: []byte(`{}`), Items: []byte(`[]`),
		TotalAmount: 1000, PaymentMethod: "razorpay", Status: status,
	}
}

func TestBackfillApprovedOrders_ConvertsApprovedToProcessing(t *testing.T) {
	db := setupBackfillDB(t)
	approved := newOrder("BACKFILL01", "approved")
	db.Create(&approved)

	affected, err := BackfillApprovedOrders(db)
	if err != nil {
		t.Fatalf("backfill returned error: %v", err)
	}
	if affected != 1 {
		t.Errorf("affected = %d, want 1", affected)
	}

	var updated models.Order
	db.First(&updated, "id = ?", approved.ID)
	if updated.Status != "processing" {
		t.Errorf("status = %q, want processing", updated.Status)
	}
}

func TestBackfillApprovedOrders_LeavesOtherStatesUnchanged(t *testing.T) {
	db := setupBackfillDB(t)
	paid := newOrder("BACKFILL02", "paid")
	db.Create(&paid)

	if _, err := BackfillApprovedOrders(db); err != nil {
		t.Fatalf("backfill returned error: %v", err)
	}

	var updated models.Order
	db.First(&updated, "id = ?", paid.ID)
	if updated.Status != "paid" {
		t.Errorf("status = %q, want paid (unchanged)", updated.Status)
	}
}

func TestBackfillApprovedOrders_Idempotent(t *testing.T) {
	db := setupBackfillDB(t)
	o := newOrder("BACKFILL03", "approved")
	db.Create(&o)

	if _, err := BackfillApprovedOrders(db); err != nil {
		t.Fatalf("first backfill returned error: %v", err)
	}

	affected, err := BackfillApprovedOrders(db)
	if err != nil {
		t.Fatalf("second backfill returned error: %v", err)
	}
	if affected != 0 {
		t.Errorf("second run affected = %d, want 0 (idempotent)", affected)
	}
}
