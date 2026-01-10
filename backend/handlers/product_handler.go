package handlers

import (
	"net/http"

	"storee/backend/models"
	"storee/backend/utils"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type ProductHandler struct {
	DB *gorm.DB
}

func NewProductHandler(db *gorm.DB) *ProductHandler {
	return &ProductHandler{DB: db}
}

// GetProducts handles GET /api/v1/products
func (h *ProductHandler) GetProducts(c *gin.Context) {
	var products []models.Product
	query := h.DB.Where("is_active = ?", true).Preload("Images").Order("created_at DESC")

	// Filter by category if provided
	if category := c.Query("category"); category != "" {
		query = query.Where("category = ?", category)
	}

	if err := query.Find(&products).Error; err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to fetch products", err)
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Products fetched successfully", products)
}

// GetProductByID handles GET /api/v1/products/:id
func (h *ProductHandler) GetProductByID(c *gin.Context) {
	id := c.Param("id")

	var product models.Product
	if err := h.DB.Where("id = ? AND is_active = ?", id, true).Preload("Images").First(&product).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			utils.ErrorResponse(c, http.StatusNotFound, "Product not found", nil)
			return
		}
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to fetch product", err)
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Product fetched successfully", product)
}

// GetProductBySlug handles GET /api/v1/products/slug/:slug
func (h *ProductHandler) GetProductBySlug(c *gin.Context) {
	slug := c.Param("slug")

	var product models.Product
	if err := h.DB.Where("slug = ? AND is_active = ?", slug, true).Preload("Images").First(&product).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			utils.ErrorResponse(c, http.StatusNotFound, "Product not found", nil)
			return
		}
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to fetch product", err)
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Product fetched successfully", product)
}
