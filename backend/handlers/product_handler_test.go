package handlers

import (
	"encoding/json"
	"net/http"
	"testing"

	"storee/backend/models"
	"storee/backend/utils"

	"github.com/google/uuid"
)

func seedProducts(t *testing.T, h *ProductHandler) (models.Product, models.Product) {
	t.Helper()
	p1 := models.Product{
		ID:        uuid.New(),
		Name:      "Active Phone",
		Slug:      "active-phone",
		BasePrice: 50000,
		Category:  "electronics",
		IsActive:  true,
		Images: []models.ProductImage{
			{ID: uuid.New(), URL: "https://example.com/phone.jpg", AltText: "Phone", IsPrimary: true},
		},
	}
	p2 := models.Product{
		ID:        uuid.New(),
		Name:      "Inactive Shirt",
		Slug:      "inactive-shirt",
		BasePrice: 1000,
		Category:  "clothing",
		IsActive:  true, // Create first (GORM default:true skips false zero-value)
	}
	if err := h.DB.Create(&p1).Error; err != nil {
		t.Fatalf("seed p1: %v", err)
	}
	if err := h.DB.Create(&p2).Error; err != nil {
		t.Fatalf("seed p2: %v", err)
	}
	// Set inactive after creation to work around GORM default:true
	h.DB.Model(&p2).Update("is_active", false)
	p2.IsActive = false
	return p1, p2
}

func TestGetProducts_EmptyDB(t *testing.T) {
	db := setupTestDB(t)
	h := NewProductHandler(db)
	r := setupTestRouter()
	r.GET("/products", h.GetProducts)

	w := performJSONRequest(r, "GET", "/products", nil, nil)
	if w.Code != http.StatusOK {
		t.Fatalf("status = %d, want %d", w.Code, http.StatusOK)
	}

	var resp utils.ApiResponse
	json.Unmarshal(w.Body.Bytes(), &resp)
	if !resp.Success {
		t.Error("expected success=true")
	}
	products, ok := resp.Data.([]interface{})
	if !ok {
		t.Fatalf("data type = %T, want []interface{}", resp.Data)
	}
	if len(products) != 0 {
		t.Errorf("products count = %d, want 0", len(products))
	}
}

func TestGetProducts_ActiveOnly(t *testing.T) {
	db := setupTestDB(t)
	h := NewProductHandler(db)
	seedProducts(t, h)

	r := setupTestRouter()
	r.GET("/products", h.GetProducts)

	w := performJSONRequest(r, "GET", "/products", nil, nil)
	var resp utils.ApiResponse
	json.Unmarshal(w.Body.Bytes(), &resp)

	products := resp.Data.([]interface{})
	if len(products) != 1 {
		t.Errorf("active products = %d, want 1", len(products))
	}
}

func TestGetProducts_CategoryFilter(t *testing.T) {
	db := setupTestDB(t)
	h := NewProductHandler(db)

	// Create two active products in different categories
	h.DB.Create(&models.Product{ID: uuid.New(), Name: "Phone", Slug: "phone", BasePrice: 50000, Category: "electronics", IsActive: true})
	h.DB.Create(&models.Product{ID: uuid.New(), Name: "Shirt", Slug: "shirt", BasePrice: 1000, Category: "clothing", IsActive: true})

	r := setupTestRouter()
	r.GET("/products", h.GetProducts)

	w := performJSONRequest(r, "GET", "/products?category=electronics", nil, nil)
	var resp utils.ApiResponse
	json.Unmarshal(w.Body.Bytes(), &resp)

	products := resp.Data.([]interface{})
	if len(products) != 1 {
		t.Errorf("filtered products = %d, want 1", len(products))
	}
}

func TestGetProducts_IncludesImages(t *testing.T) {
	db := setupTestDB(t)
	h := NewProductHandler(db)
	seedProducts(t, h)

	r := setupTestRouter()
	r.GET("/products", h.GetProducts)

	w := performJSONRequest(r, "GET", "/products", nil, nil)
	var resp utils.ApiResponse
	json.Unmarshal(w.Body.Bytes(), &resp)

	products := resp.Data.([]interface{})
	if len(products) == 0 {
		t.Fatal("no products returned")
	}
	p := products[0].(map[string]interface{})
	images, ok := p["images"].([]interface{})
	if !ok {
		t.Fatalf("images type = %T, want []interface{}", p["images"])
	}
	if len(images) != 1 {
		t.Errorf("images count = %d, want 1", len(images))
	}
}

func TestGetProductByID_Found(t *testing.T) {
	db := setupTestDB(t)
	h := NewProductHandler(db)
	p1, _ := seedProducts(t, h)

	r := setupTestRouter()
	r.GET("/products/:id", h.GetProductByID)

	w := performJSONRequest(r, "GET", "/products/"+p1.ID.String(), nil, nil)
	if w.Code != http.StatusOK {
		t.Errorf("status = %d, want %d", w.Code, http.StatusOK)
	}
}

func TestGetProductByID_NotFound(t *testing.T) {
	db := setupTestDB(t)
	h := NewProductHandler(db)

	r := setupTestRouter()
	r.GET("/products/:id", h.GetProductByID)

	w := performJSONRequest(r, "GET", "/products/"+uuid.New().String(), nil, nil)
	if w.Code != http.StatusNotFound {
		t.Errorf("status = %d, want %d", w.Code, http.StatusNotFound)
	}
}

func TestGetProductByID_InactiveNotFound(t *testing.T) {
	db := setupTestDB(t)
	h := NewProductHandler(db)
	_, p2 := seedProducts(t, h)

	r := setupTestRouter()
	r.GET("/products/:id", h.GetProductByID)

	w := performJSONRequest(r, "GET", "/products/"+p2.ID.String(), nil, nil)
	if w.Code != http.StatusNotFound {
		t.Errorf("status = %d, want %d (inactive product)", w.Code, http.StatusNotFound)
	}
}

func TestGetProductBySlug_Found(t *testing.T) {
	db := setupTestDB(t)
	h := NewProductHandler(db)
	seedProducts(t, h)

	r := setupTestRouter()
	r.GET("/products/slug/:slug", h.GetProductBySlug)

	w := performJSONRequest(r, "GET", "/products/slug/active-phone", nil, nil)
	if w.Code != http.StatusOK {
		t.Errorf("status = %d, want %d", w.Code, http.StatusOK)
	}
}

func TestGetProductBySlug_NotFound(t *testing.T) {
	db := setupTestDB(t)
	h := NewProductHandler(db)

	r := setupTestRouter()
	r.GET("/products/slug/:slug", h.GetProductBySlug)

	w := performJSONRequest(r, "GET", "/products/slug/nonexistent", nil, nil)
	if w.Code != http.StatusNotFound {
		t.Errorf("status = %d, want %d", w.Code, http.StatusNotFound)
	}
}

func TestGetProductBySlug_IncludesImages(t *testing.T) {
	db := setupTestDB(t)
	h := NewProductHandler(db)
	seedProducts(t, h)

	r := setupTestRouter()
	r.GET("/products/slug/:slug", h.GetProductBySlug)

	w := performJSONRequest(r, "GET", "/products/slug/active-phone", nil, nil)
	var resp map[string]interface{}
	json.Unmarshal(w.Body.Bytes(), &resp)

	data := resp["data"].(map[string]interface{})
	images := data["images"].([]interface{})
	if len(images) != 1 {
		t.Errorf("images count = %d, want 1", len(images))
	}
}
