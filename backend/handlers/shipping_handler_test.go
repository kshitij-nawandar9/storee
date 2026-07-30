package handlers

import (
	"testing"
	"time"

	"storee/backend/models"

	"gorm.io/datatypes"
)

func testOrder() *models.Order {
	return &models.Order{
		OrderID:       "ABC1234567",
		CustomerName:  "Kshitij Nawandar",
		CustomerEmail: "customer@example.com",
		CustomerPhone: "9876543210",
		Address:       datatypes.JSON([]byte(`{"line1":"12 MG Road","line2":"Flat 4","city":"Pune","state":"Maharashtra","pincode":"411001"}`)),
		Items:         datatypes.JSON([]byte(`[{"name":"Dental Kit","sku":"DK-1","quantity":2,"price":49900},{"quantity":1,"product":{"name":"Sunglasses Pouch","basePrice":29900},"variant":{"sku":"SP-BLK"}}]`)),
		TotalAmount:   129700,
		Status:        "processing",
		PaymentMethod: "cod",
		CreatedAt:     time.Date(2026, 7, 30, 10, 30, 0, 0, time.UTC),
	}
}

func TestBuildShiprocketOrder(t *testing.T) {
	order := testOrder()
	req, err := BuildShiprocketOrder(order, "Primary", ShipOrderRequest{})
	if err != nil {
		t.Fatalf("BuildShiprocketOrder() error = %v", err)
	}

	if req.OrderID != "ABC1234567" {
		t.Errorf("OrderID = %q, want ABC1234567", req.OrderID)
	}
	if req.OrderDate != "2026-07-30 10:30" {
		t.Errorf("OrderDate = %q, want 2026-07-30 10:30", req.OrderDate)
	}
	if req.PickupLocation != "Primary" {
		t.Errorf("PickupLocation = %q, want Primary", req.PickupLocation)
	}
	if req.BillingCustomerName != "Kshitij" || req.BillingLastName != "Nawandar" {
		t.Errorf("name split = %q / %q, want Kshitij / Nawandar", req.BillingCustomerName, req.BillingLastName)
	}
	if req.BillingAddress != "12 MG Road" || req.BillingAddress2 != "Flat 4" || req.BillingCity != "Pune" ||
		req.BillingState != "Maharashtra" || req.BillingPincode != "411001" || req.BillingCountry != "India" {
		t.Errorf("address mapped incorrectly: %+v", req)
	}
	if req.PaymentMethod != "COD" {
		t.Errorf("PaymentMethod = %q, want COD", req.PaymentMethod)
	}
	if req.SubTotal != 1297.00 {
		t.Errorf("SubTotal = %v, want 1297.00", req.SubTotal)
	}

	if len(req.OrderItems) != 2 {
		t.Fatalf("OrderItems length = %d, want 2", len(req.OrderItems))
	}
	first := req.OrderItems[0]
	if first.Name != "Dental Kit" || first.SKU != "DK-1" || first.Units != 2 || first.SellingPrice != 499.00 {
		t.Errorf("first item mapped incorrectly: %+v", first)
	}
	// Second item exercises the fallbacks: name/price from product, sku from variant.
	second := req.OrderItems[1]
	if second.Name != "Sunglasses Pouch" || second.SKU != "SP-BLK" || second.Units != 1 || second.SellingPrice != 299.00 {
		t.Errorf("second item fallbacks mapped incorrectly: %+v", second)
	}

	// Defaults applied when no dimensions provided.
	if req.Length != 10 || req.Breadth != 10 || req.Height != 10 || req.Weight != 0.5 {
		t.Errorf("default dimensions = %v x %v x %v, %v kg", req.Length, req.Breadth, req.Height, req.Weight)
	}
}

func TestBuildShiprocketOrder_PrepaidAndOverrides(t *testing.T) {
	order := testOrder()
	order.PaymentMethod = "razorpay"

	req, err := BuildShiprocketOrder(order, "Warehouse", ShipOrderRequest{Length: 20, Breadth: 15, Height: 8, Weight: 1.2})
	if err != nil {
		t.Fatalf("BuildShiprocketOrder() error = %v", err)
	}
	if req.PaymentMethod != "Prepaid" {
		t.Errorf("PaymentMethod = %q, want Prepaid", req.PaymentMethod)
	}
	if req.Length != 20 || req.Breadth != 15 || req.Height != 8 || req.Weight != 1.2 {
		t.Errorf("dimension overrides not applied: %v x %v x %v, %v kg", req.Length, req.Breadth, req.Height, req.Weight)
	}
}

func TestBuildShiprocketOrder_InvalidData(t *testing.T) {
	order := testOrder()
	order.Address = datatypes.JSON([]byte(`{"line1":"","city":"","state":"","pincode":""}`))
	if _, err := BuildShiprocketOrder(order, "Primary", ShipOrderRequest{}); err == nil {
		t.Error("expected error for incomplete address, got nil")
	}

	order = testOrder()
	order.Items = datatypes.JSON([]byte(`[]`))
	if _, err := BuildShiprocketOrder(order, "Primary", ShipOrderRequest{}); err == nil {
		t.Error("expected error for empty items, got nil")
	}
}
