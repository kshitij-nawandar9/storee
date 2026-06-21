package handlers

import (
	"encoding/json"
	"net/http"
	"testing"

	"storee/backend/models"
	"storee/backend/utils"

	"github.com/google/uuid"
	"gorm.io/datatypes"
)

func validCreateProductBody() []byte {
	body, _ := json.Marshal(map[string]interface{}{
		"name":      "Test Product",
		"slug":      "test-product",
		"basePrice": 50000,
		"category":  "electronics",
		"isActive":  true,
		"features":  []string{"feature1", "feature2"},
		"images": []map[string]interface{}{
			{"url": "https://example.com/img.jpg", "altText": "Product image", "order": 0, "isPrimary": true},
		},
	})
	return body
}

func TestCreateProduct_Success(t *testing.T) {
	db := setupTestDB(t)
	h := NewAdminHandler(db)

	r := setupTestRouter()
	r.POST("/admin/products", h.CreateProduct)

	w := performJSONRequest(r, "POST", "/admin/products", validCreateProductBody(), nil)
	if w.Code != http.StatusCreated {
		t.Fatalf("status = %d, want %d, body: %s", w.Code, http.StatusCreated, w.Body.String())
	}

	var resp utils.ApiResponse
	json.Unmarshal(w.Body.Bytes(), &resp)
	product := resp.Data.(map[string]interface{})
	if product["name"] != "Test Product" {
		t.Errorf("name = %v, want Test Product", product["name"])
	}
	if product["slug"] != "test-product" {
		t.Errorf("slug = %v, want test-product", product["slug"])
	}
	images := product["images"].([]interface{})
	if len(images) != 1 {
		t.Errorf("images count = %d, want 1", len(images))
	}
}

func TestCreateProduct_DuplicateSlug(t *testing.T) {
	db := setupTestDB(t)
	h := NewAdminHandler(db)

	r := setupTestRouter()
	r.POST("/admin/products", h.CreateProduct)

	// Create first product
	performJSONRequest(r, "POST", "/admin/products", validCreateProductBody(), nil)

	// Try creating with same slug
	w := performJSONRequest(r, "POST", "/admin/products", validCreateProductBody(), nil)
	if w.Code != http.StatusConflict {
		t.Errorf("status = %d, want %d (duplicate slug)", w.Code, http.StatusConflict)
	}
}

func TestCreateProduct_MissingFields(t *testing.T) {
	db := setupTestDB(t)
	h := NewAdminHandler(db)

	r := setupTestRouter()
	r.POST("/admin/products", h.CreateProduct)

	body, _ := json.Marshal(map[string]interface{}{
		"name": "No Price Product",
	})
	w := performJSONRequest(r, "POST", "/admin/products", body, nil)
	if w.Code != http.StatusBadRequest {
		t.Errorf("status = %d, want %d", w.Code, http.StatusBadRequest)
	}
}

func TestUpdateProduct_Success(t *testing.T) {
	db := setupTestDB(t)
	h := NewAdminHandler(db)

	product := models.Product{
		ID: uuid.New(), Name: "Original", Slug: "original", BasePrice: 1000, Category: "test", IsActive: true,
	}
	db.Create(&product)

	r := setupTestRouter()
	r.PUT("/admin/products/:id", h.UpdateProduct)

	body, _ := json.Marshal(map[string]interface{}{
		"name": "Updated Name",
	})
	w := performJSONRequest(r, "PUT", "/admin/products/"+product.ID.String(), body, nil)
	if w.Code != http.StatusOK {
		t.Fatalf("status = %d, want %d, body: %s", w.Code, http.StatusOK, w.Body.String())
	}

	var resp utils.ApiResponse
	json.Unmarshal(w.Body.Bytes(), &resp)
	p := resp.Data.(map[string]interface{})
	if p["name"] != "Updated Name" {
		t.Errorf("name = %v, want Updated Name", p["name"])
	}
}

func TestUpdateProduct_NotFound(t *testing.T) {
	db := setupTestDB(t)
	h := NewAdminHandler(db)

	r := setupTestRouter()
	r.PUT("/admin/products/:id", h.UpdateProduct)

	body, _ := json.Marshal(map[string]interface{}{"name": "X"})
	w := performJSONRequest(r, "PUT", "/admin/products/"+uuid.New().String(), body, nil)
	if w.Code != http.StatusNotFound {
		t.Errorf("status = %d, want %d", w.Code, http.StatusNotFound)
	}
}

func TestUpdateProduct_SlugConflict(t *testing.T) {
	db := setupTestDB(t)
	h := NewAdminHandler(db)

	p1 := models.Product{ID: uuid.New(), Name: "P1", Slug: "slug-one", BasePrice: 1000, Category: "test"}
	p2 := models.Product{ID: uuid.New(), Name: "P2", Slug: "slug-two", BasePrice: 2000, Category: "test"}
	db.Create(&p1)
	db.Create(&p2)

	r := setupTestRouter()
	r.PUT("/admin/products/:id", h.UpdateProduct)

	body, _ := json.Marshal(map[string]interface{}{"slug": "slug-one"})
	w := performJSONRequest(r, "PUT", "/admin/products/"+p2.ID.String(), body, nil)
	if w.Code != http.StatusConflict {
		t.Errorf("status = %d, want %d (slug conflict)", w.Code, http.StatusConflict)
	}
}

func TestUpdateProduct_PartialUpdate(t *testing.T) {
	db := setupTestDB(t)
	h := NewAdminHandler(db)

	product := models.Product{
		ID: uuid.New(), Name: "Original", Slug: "partial-test", BasePrice: 1000, Category: "electronics", IsActive: true,
	}
	db.Create(&product)

	r := setupTestRouter()
	r.PUT("/admin/products/:id", h.UpdateProduct)

	newPrice := int64(2000)
	body, _ := json.Marshal(map[string]interface{}{"basePrice": newPrice})
	w := performJSONRequest(r, "PUT", "/admin/products/"+product.ID.String(), body, nil)
	if w.Code != http.StatusOK {
		t.Fatalf("status = %d, want %d", w.Code, http.StatusOK)
	}

	var resp utils.ApiResponse
	json.Unmarshal(w.Body.Bytes(), &resp)
	p := resp.Data.(map[string]interface{})
	if p["name"] != "Original" {
		t.Errorf("name changed to %v, should remain Original", p["name"])
	}
}

func TestUpdateProduct_ImageCascade(t *testing.T) {
	db := setupTestDB(t)
	h := NewAdminHandler(db)

	product := models.Product{
		ID: uuid.New(), Name: "Img Product", Slug: "img-product", BasePrice: 1000, Category: "test",
		Images: []models.ProductImage{
			{ID: uuid.New(), URL: "https://old.jpg", AltText: "Old"},
		},
	}
	db.Create(&product)

	r := setupTestRouter()
	r.PUT("/admin/products/:id", h.UpdateProduct)

	body, _ := json.Marshal(map[string]interface{}{
		"images": []map[string]interface{}{
			{"url": "https://new1.jpg", "altText": "New1", "order": 0},
			{"url": "https://new2.jpg", "altText": "New2", "order": 1},
		},
	})
	w := performJSONRequest(r, "PUT", "/admin/products/"+product.ID.String(), body, nil)
	if w.Code != http.StatusOK {
		t.Fatalf("status = %d, want %d", w.Code, http.StatusOK)
	}

	// Verify old images deleted and new ones created
	var images []models.ProductImage
	db.Where("product_id = ?", product.ID).Find(&images)
	if len(images) != 2 {
		t.Errorf("images count = %d, want 2", len(images))
	}
}

func TestDeleteProduct_Success(t *testing.T) {
	db := setupTestDB(t)
	h := NewAdminHandler(db)

	product := models.Product{ID: uuid.New(), Name: "ToDelete", Slug: "to-delete", BasePrice: 1000, Category: "test"}
	db.Create(&product)

	r := setupTestRouter()
	r.DELETE("/admin/products/:id", h.DeleteProduct)

	w := performJSONRequest(r, "DELETE", "/admin/products/"+product.ID.String(), nil, nil)
	if w.Code != http.StatusOK {
		t.Errorf("status = %d, want %d", w.Code, http.StatusOK)
	}

	// Verify soft deleted
	var count int64
	db.Model(&models.Product{}).Where("id = ?", product.ID).Count(&count)
	if count != 0 {
		t.Error("product should be soft deleted")
	}

	// But still exists with unscoped
	db.Unscoped().Model(&models.Product{}).Where("id = ?", product.ID).Count(&count)
	if count != 1 {
		t.Error("product should still exist unscoped")
	}
}

func TestDeleteProduct_NotFound(t *testing.T) {
	db := setupTestDB(t)
	h := NewAdminHandler(db)

	r := setupTestRouter()
	r.DELETE("/admin/products/:id", h.DeleteProduct)

	w := performJSONRequest(r, "DELETE", "/admin/products/"+uuid.New().String(), nil, nil)
	if w.Code != http.StatusNotFound {
		t.Errorf("status = %d, want %d", w.Code, http.StatusNotFound)
	}
}

func TestGetAllProducts_IncludesInactive(t *testing.T) {
	db := setupTestDB(t)
	h := NewAdminHandler(db)

	db.Create(&models.Product{ID: uuid.New(), Name: "Active", Slug: "active", BasePrice: 1000, Category: "test", IsActive: true})
	p2 := models.Product{ID: uuid.New(), Name: "Inactive", Slug: "inactive", BasePrice: 1000, Category: "test", IsActive: true}
	db.Create(&p2)
	db.Model(&p2).Update("is_active", false)

	r := setupTestRouter()
	r.GET("/admin/products", h.GetAllProducts)

	w := performJSONRequest(r, "GET", "/admin/products", nil, nil)
	var resp utils.ApiResponse
	json.Unmarshal(w.Body.Bytes(), &resp)

	products := resp.Data.([]interface{})
	if len(products) != 2 {
		t.Errorf("products count = %d, want 2 (includes inactive)", len(products))
	}
}

func TestGetAllProducts_FilterByIsActive(t *testing.T) {
	db := setupTestDB(t)
	h := NewAdminHandler(db)

	db.Create(&models.Product{ID: uuid.New(), Name: "Active", Slug: "a-active", BasePrice: 1000, Category: "test", IsActive: true})
	p2 := models.Product{ID: uuid.New(), Name: "Inactive", Slug: "a-inactive", BasePrice: 1000, Category: "test", IsActive: true}
	db.Create(&p2)
	db.Model(&p2).Update("is_active", false)

	r := setupTestRouter()
	r.GET("/admin/products", h.GetAllProducts)

	// Filter for active products (true works reliably across SQLite/MySQL)
	w := performJSONRequest(r, "GET", "/admin/products?isActive=true", nil, nil)
	var resp utils.ApiResponse
	json.Unmarshal(w.Body.Bytes(), &resp)

	products := resp.Data.([]interface{})
	if len(products) != 1 {
		t.Errorf("filtered active products = %d, want 1", len(products))
	}
}

func TestGetAllOrders_Pagination(t *testing.T) {
	db := setupTestDB(t)
	h := NewAdminHandler(db)

	for i := 0; i < 5; i++ {
		db.Create(&models.Order{
			OrderID: utils.GenerateOrderID(), CustomerName: "Test", CustomerEmail: "t@t.com",
			CustomerPhone: "1234567890", Address: datatypes.JSON([]byte(`{}`)), Items: datatypes.JSON([]byte(`[]`)),
			TotalAmount: 1000, PaymentMethod: "cod",
		})
	}

	r := setupTestRouter()
	r.GET("/admin/orders", h.GetAllOrders)

	w := performJSONRequest(r, "GET", "/admin/orders?page=1&limit=2", nil, nil)
	if w.Code != http.StatusOK {
		t.Fatalf("status = %d, want %d", w.Code, http.StatusOK)
	}

	var resp utils.ApiResponse
	json.Unmarshal(w.Body.Bytes(), &resp)
	data := resp.Data.(map[string]interface{})
	orders := data["orders"].([]interface{})
	if len(orders) != 2 {
		t.Errorf("orders count = %d, want 2", len(orders))
	}

	pagination := data["pagination"].(map[string]interface{})
	if pagination["total"].(float64) != 5 {
		t.Errorf("total = %v, want 5", pagination["total"])
	}
	if pagination["pages"].(float64) != 3 {
		t.Errorf("pages = %v, want 3", pagination["pages"])
	}
}

func TestGetAllOrders_StatusFilter(t *testing.T) {
	db := setupTestDB(t)
	h := NewAdminHandler(db)

	db.Create(&models.Order{
		OrderID: "AAAA000001", CustomerName: "A", CustomerEmail: "a@a.com",
		CustomerPhone: "1111111111", Address: datatypes.JSON([]byte(`{}`)), Items: datatypes.JSON([]byte(`[]`)),
		TotalAmount: 1000, PaymentMethod: "cod", Status: "pending",
	})
	db.Create(&models.Order{
		OrderID: "AAAA000002", CustomerName: "B", CustomerEmail: "b@b.com",
		CustomerPhone: "2222222222", Address: datatypes.JSON([]byte(`{}`)), Items: datatypes.JSON([]byte(`[]`)),
		TotalAmount: 2000, PaymentMethod: "razorpay", Status: "paid",
	})

	r := setupTestRouter()
	r.GET("/admin/orders", h.GetAllOrders)

	w := performJSONRequest(r, "GET", "/admin/orders?status=paid", nil, nil)
	var resp utils.ApiResponse
	json.Unmarshal(w.Body.Bytes(), &resp)
	data := resp.Data.(map[string]interface{})
	orders := data["orders"].([]interface{})
	if len(orders) != 1 {
		t.Errorf("filtered orders = %d, want 1", len(orders))
	}
}

func statusBody(status string) []byte {
	body, _ := json.Marshal(map[string]string{"status": status})
	return body
}

func TestUpdateOrderStatus_PaidToProcessing(t *testing.T) {
	db := setupTestDB(t)
	h := NewAdminHandler(db)

	order := models.Order{
		OrderID: "STATUS001", CustomerName: "Test", CustomerEmail: "t@t.com",
		CustomerPhone: "1234567890", Address: datatypes.JSON([]byte(`{}`)), Items: datatypes.JSON([]byte(`[]`)),
		TotalAmount: 1000, PaymentMethod: "razorpay", Status: "paid",
	}
	db.Create(&order)

	r := setupTestRouter()
	r.PUT("/admin/orders/:id/status", h.UpdateOrderStatus)

	w := performJSONRequest(r, "PUT", "/admin/orders/"+order.ID.String()+"/status", statusBody("processing"), nil)
	if w.Code != http.StatusOK {
		t.Fatalf("status = %d, want %d, body: %s", w.Code, http.StatusOK, w.Body.String())
	}

	var updated models.Order
	db.First(&updated, "id = ?", order.ID)
	if updated.Status != "processing" {
		t.Errorf("status = %q, want processing", updated.Status)
	}
}

func TestUpdateOrderStatus_FullChain(t *testing.T) {
	db := setupTestDB(t)
	h := NewAdminHandler(db)

	order := models.Order{
		OrderID: "STATUS002", CustomerName: "Test", CustomerEmail: "t@t.com",
		CustomerPhone: "1234567890", Address: datatypes.JSON([]byte(`{}`)), Items: datatypes.JSON([]byte(`[]`)),
		TotalAmount: 1000, PaymentMethod: "razorpay", Status: "paid",
	}
	db.Create(&order)

	r := setupTestRouter()
	r.PUT("/admin/orders/:id/status", h.UpdateOrderStatus)

	for _, next := range []string{"processing", "shipped", "delivered"} {
		w := performJSONRequest(r, "PUT", "/admin/orders/"+order.ID.String()+"/status", statusBody(next), nil)
		if w.Code != http.StatusOK {
			t.Fatalf("transition to %q: status = %d, want %d, body: %s", next, w.Code, http.StatusOK, w.Body.String())
		}
	}
}

func TestUpdateOrderStatus_IllegalJump(t *testing.T) {
	db := setupTestDB(t)
	h := NewAdminHandler(db)

	order := models.Order{
		OrderID: "STATUS003", CustomerName: "Test", CustomerEmail: "t@t.com",
		CustomerPhone: "1234567890", Address: datatypes.JSON([]byte(`{}`)), Items: datatypes.JSON([]byte(`[]`)),
		TotalAmount: 1000, PaymentMethod: "razorpay", Status: "paid",
	}
	db.Create(&order)

	r := setupTestRouter()
	r.PUT("/admin/orders/:id/status", h.UpdateOrderStatus)

	w := performJSONRequest(r, "PUT", "/admin/orders/"+order.ID.String()+"/status", statusBody("shipped"), nil)
	if w.Code != http.StatusBadRequest {
		t.Errorf("status = %d, want %d (illegal jump paid->shipped)", w.Code, http.StatusBadRequest)
	}
}

func TestUpdateOrderStatus_CancelFromAnyState(t *testing.T) {
	db := setupTestDB(t)
	h := NewAdminHandler(db)

	order := models.Order{
		OrderID: "STATUS004", CustomerName: "Test", CustomerEmail: "t@t.com",
		CustomerPhone: "1234567890", Address: datatypes.JSON([]byte(`{}`)), Items: datatypes.JSON([]byte(`[]`)),
		TotalAmount: 1000, PaymentMethod: "razorpay", Status: "shipped",
	}
	db.Create(&order)

	r := setupTestRouter()
	r.PUT("/admin/orders/:id/status", h.UpdateOrderStatus)

	w := performJSONRequest(r, "PUT", "/admin/orders/"+order.ID.String()+"/status", statusBody("cancelled"), nil)
	if w.Code != http.StatusOK {
		t.Errorf("status = %d, want %d (cancel from shipped)", w.Code, http.StatusOK)
	}
}

func TestUpdateOrderStatus_RestoreFromCancelled(t *testing.T) {
	db := setupTestDB(t)
	h := NewAdminHandler(db)

	order := models.Order{
		OrderID: "STATUS005", CustomerName: "Test", CustomerEmail: "t@t.com",
		CustomerPhone: "1234567890", Address: datatypes.JSON([]byte(`{}`)), Items: datatypes.JSON([]byte(`[]`)),
		TotalAmount: 1000, PaymentMethod: "razorpay", Status: "cancelled",
	}
	db.Create(&order)

	r := setupTestRouter()
	r.PUT("/admin/orders/:id/status", h.UpdateOrderStatus)

	w := performJSONRequest(r, "PUT", "/admin/orders/"+order.ID.String()+"/status", statusBody("paid"), nil)
	if w.Code != http.StatusOK {
		t.Errorf("status = %d, want %d (restore cancelled->paid)", w.Code, http.StatusOK)
	}
}

func TestUpdateOrderStatus_ByOrderID(t *testing.T) {
	db := setupTestDB(t)
	h := NewAdminHandler(db)

	order := models.Order{
		OrderID: "BYORDERID1", CustomerName: "Test", CustomerEmail: "t@t.com",
		CustomerPhone: "1234567890", Address: datatypes.JSON([]byte(`{}`)), Items: datatypes.JSON([]byte(`[]`)),
		TotalAmount: 1000, PaymentMethod: "razorpay", Status: "paid",
	}
	db.Create(&order)

	r := setupTestRouter()
	r.PUT("/admin/orders/:id/status", h.UpdateOrderStatus)

	w := performJSONRequest(r, "PUT", "/admin/orders/BYORDERID1/status", statusBody("processing"), nil)
	if w.Code != http.StatusOK {
		t.Errorf("status = %d, want %d (lookup by order_id)", w.Code, http.StatusOK)
	}
}

func TestUpdateOrderStatus_NotFound(t *testing.T) {
	db := setupTestDB(t)
	h := NewAdminHandler(db)

	r := setupTestRouter()
	r.PUT("/admin/orders/:id/status", h.UpdateOrderStatus)

	w := performJSONRequest(r, "PUT", "/admin/orders/NONEXISTENT/status", statusBody("processing"), nil)
	if w.Code != http.StatusNotFound {
		t.Errorf("status = %d, want %d", w.Code, http.StatusNotFound)
	}
}

func TestGenerateSlug(t *testing.T) {
	tests := []struct {
		input string
		want  string
	}{
		{"Simple Product", "simple-product"},
		{"Product With_Underscore", "product-with-underscore"},
		{"Special @#$ Characters!", "special--characters"},
		{"UPPERCASE Name", "uppercase-name"},
		{"123 Numbers", "123-numbers"},
	}
	for _, tc := range tests {
		got := generateSlug(tc.input)
		if got != tc.want {
			t.Errorf("generateSlug(%q) = %q, want %q", tc.input, got, tc.want)
		}
	}
}
