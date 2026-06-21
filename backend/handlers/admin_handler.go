package handlers

import (
	"fmt"
	"net/http"
	"strings"

	"storee/backend/models"
	"storee/backend/utils"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type AdminHandler struct {
	DB *gorm.DB
}

func NewAdminHandler(db *gorm.DB) *AdminHandler {
	return &AdminHandler{DB: db}
}

type CreateProductRequest struct {
	Name        string   `json:"name" binding:"required"`
	Slug        string   `json:"slug" binding:"required"`
	Description string   `json:"description"`
	BasePrice   int64    `json:"basePrice" binding:"required"` // in paise
	Category    string   `json:"category" binding:"required"`
	Stock       *int     `json:"stock"`
	IsActive    bool     `json:"isActive"`
	Features    []string `json:"features"`
	Images      []struct {
		URL       string `json:"url" binding:"required"`
		AltText   string `json:"altText"`
		Order     int    `json:"order"`
		IsPrimary bool   `json:"isPrimary"`
	} `json:"images"`
}

type UpdateProductRequest struct {
	Name        string   `json:"name"`
	Slug        string   `json:"slug"`
	Description string   `json:"description"`
	BasePrice   *int64   `json:"basePrice"` // in paise
	Category    string   `json:"category"`
	Stock       *int     `json:"stock"`
	IsActive    *bool    `json:"isActive"`
	Features    []string `json:"features"`
	Images      []struct {
		ID        string `json:"id"`
		URL       string `json:"url"`
		AltText   string `json:"altText"`
		Order     int    `json:"order"`
		IsPrimary bool   `json:"isPrimary"`
	} `json:"images"`
}

// CreateProduct handles POST /api/v1/admin/products
func (h *AdminHandler) CreateProduct(c *gin.Context) {
	var req CreateProductRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid request data", err)
		return
	}

	// Generate slug if not provided
	slug := req.Slug
	if slug == "" {
		slug = generateSlug(req.Name)
	}

	// Check if slug already exists
	var existingProduct models.Product
	if err := h.DB.Where("slug = ?", slug).First(&existingProduct).Error; err == nil {
		utils.ErrorResponse(c, http.StatusConflict, "Product with this slug already exists", nil)
		return
	}

	// Create product
	product := models.Product{
		Name:        req.Name,
		Slug:        slug,
		Description: req.Description,
		BasePrice:   req.BasePrice,
		Category:    req.Category,
		Stock:       req.Stock,
		IsActive:    req.IsActive,
		Features:    req.Features,
	}

	// Create product images
	if len(req.Images) > 0 {
		product.Images = make([]models.ProductImage, len(req.Images))
		for i, img := range req.Images {
			product.Images[i] = models.ProductImage{
				URL:       img.URL,
				AltText:   img.AltText,
				Order:     img.Order,
				IsPrimary: img.IsPrimary,
			}
		}
	}

	if err := h.DB.Create(&product).Error; err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to create product", err)
		return
	}

	// Reload with images
	h.DB.Preload("Images").First(&product, product.ID)

	utils.SuccessResponse(c, http.StatusCreated, "Product created successfully", product)
}

// UpdateProduct handles PUT /api/v1/admin/products/:id
func (h *AdminHandler) UpdateProduct(c *gin.Context) {
	id := c.Param("id")

	var product models.Product
	if err := h.DB.Preload("Images").First(&product, "id = ?", id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			utils.ErrorResponse(c, http.StatusNotFound, "Product not found", nil)
			return
		}
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to fetch product", err)
		return
	}

	var req UpdateProductRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid request data", err)
		return
	}

	// Update fields if provided
	if req.Name != "" {
		product.Name = req.Name
	}
	if req.Slug != "" && req.Slug != product.Slug {
		// Check if new slug already exists
		var existingProduct models.Product
		if err := h.DB.Where("slug = ? AND id != ?", req.Slug, id).First(&existingProduct).Error; err == nil {
			utils.ErrorResponse(c, http.StatusConflict, "Product with this slug already exists", nil)
			return
		}
		product.Slug = req.Slug
	}
	if req.Description != "" {
		product.Description = req.Description
	}
	if req.BasePrice != nil {
		product.BasePrice = *req.BasePrice
	}
	if req.Category != "" {
		product.Category = req.Category
	}
	if req.Stock != nil {
		product.Stock = req.Stock
	}
	if req.IsActive != nil {
		product.IsActive = *req.IsActive
	}
	if req.Features != nil {
		product.Features = req.Features
	}

	// Update images if provided
	if req.Images != nil {
		// Delete existing images
		h.DB.Where("product_id = ?", product.ID).Delete(&models.ProductImage{})

		// Create new images
		if len(req.Images) > 0 {
			images := make([]models.ProductImage, len(req.Images))
			for i, img := range req.Images {
				imageID := uuid.New()
				if img.ID != "" {
					if parsedID, err := uuid.Parse(img.ID); err == nil {
						imageID = parsedID
					}
				}
				images[i] = models.ProductImage{
					ID:        imageID,
					ProductID: product.ID,
					URL:       img.URL,
					AltText:   img.AltText,
					Order:     img.Order,
					IsPrimary: img.IsPrimary,
				}
			}
			product.Images = images
		}
	}

	if err := h.DB.Save(&product).Error; err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to update product", err)
		return
	}

	// Reload with images
	h.DB.Preload("Images").First(&product, product.ID)

	utils.SuccessResponse(c, http.StatusOK, "Product updated successfully", product)
}

// DeleteProduct handles DELETE /api/v1/admin/products/:id
func (h *AdminHandler) DeleteProduct(c *gin.Context) {
	id := c.Param("id")

	var product models.Product
	if err := h.DB.First(&product, "id = ?", id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			utils.ErrorResponse(c, http.StatusNotFound, "Product not found", nil)
			return
		}
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to fetch product", err)
		return
	}

	// Soft delete (GORM will handle this with DeletedAt)
	if err := h.DB.Delete(&product).Error; err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to delete product", err)
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Product deleted successfully", nil)
}

// GetAllProducts handles GET /api/v1/admin/products (includes inactive products)
func (h *AdminHandler) GetAllProducts(c *gin.Context) {
	var products []models.Product
	query := h.DB.Preload("Images").Order("created_at DESC")

	// Filter by category if provided
	if category := c.Query("category"); category != "" {
		query = query.Where("category = ?", category)
	}

	// Filter by active status if provided
	if isActive := c.Query("isActive"); isActive != "" {
		if isActive == "true" {
			query = query.Where("is_active = ?", true)
		} else if isActive == "false" {
			query = query.Where("is_active = ?", false)
		}
	}

	if err := query.Find(&products).Error; err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to fetch products", err)
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Products fetched successfully", products)
}

// GetAllOrders handles GET /api/v1/admin/orders
func (h *AdminHandler) GetAllOrders(c *gin.Context) {
	var orders []models.Order
	query := h.DB.Order("created_at DESC")

	// Filter by status if provided
	if status := c.Query("status"); status != "" {
		query = query.Where("status = ?", status)
	}

	// Filter by payment method if provided
	if paymentMethod := c.Query("paymentMethod"); paymentMethod != "" {
		query = query.Where("payment_method = ?", paymentMethod)
	}

	// Pagination support
	page := c.DefaultQuery("page", "1")
	limit := c.DefaultQuery("limit", "50")
	
	var pageNum, limitNum int
	if _, err := fmt.Sscanf(page, "%d", &pageNum); err != nil || pageNum < 1 {
		pageNum = 1
	}
	if _, err := fmt.Sscanf(limit, "%d", &limitNum); err != nil || limitNum < 1 {
		limitNum = 50
	}
	if limitNum > 100 {
		limitNum = 100 // Max limit
	}

	offset := (pageNum - 1) * limitNum
	query = query.Offset(offset).Limit(limitNum)

	// Get total count for pagination
	var total int64
	h.DB.Model(&models.Order{}).Count(&total)

	if err := query.Find(&orders).Error; err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to fetch orders", err)
		return
	}

	response := gin.H{
		"orders": orders,
		"pagination": gin.H{
			"page":  pageNum,
			"limit": limitNum,
			"total": total,
			"pages": (total + int64(limitNum) - 1) / int64(limitNum), // Calculate total pages
		},
	}

	utils.SuccessResponse(c, http.StatusOK, "Orders fetched successfully", response)
}

// UpdateOrderStatus handles PUT /api/v1/admin/orders/:id/status
func (h *AdminHandler) UpdateOrderStatus(c *gin.Context) {
	orderID := c.Param("id")

	var req struct {
		Status string `json:"status" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "status is required", err)
		return
	}

	var order models.Order
	if err := h.DB.Where("id = ? OR order_id = ?", orderID, orderID).First(&order).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			utils.ErrorResponse(c, http.StatusNotFound, "Order not found", nil)
			return
		}
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to fetch order", err)
		return
	}

	if !order.CanTransitionTo(req.Status) {
		utils.ErrorResponse(c, http.StatusBadRequest, fmt.Sprintf("Cannot change order status from %q to %q", order.Status, req.Status), nil)
		return
	}

	order.Status = req.Status
	if err := h.DB.Save(&order).Error; err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to update order status", err)
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Order status updated successfully", order)
}

// generateSlug creates a URL-friendly slug from a name
func generateSlug(name string) string {
	slug := strings.ToLower(name)
	slug = strings.ReplaceAll(slug, " ", "-")
	slug = strings.ReplaceAll(slug, "_", "-")
	// Remove special characters (keep only alphanumeric and hyphens)
	var result strings.Builder
	for _, char := range slug {
		if (char >= 'a' && char <= 'z') || (char >= '0' && char <= '9') || char == '-' {
			result.WriteRune(char)
		}
	}
	return result.String()
}
