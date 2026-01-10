package routes

import (
	"storee/backend/config"
	"storee/backend/handlers"
	"storee/backend/middleware"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func SetupRoutes(router *gin.Engine, db *gorm.DB, cfg *config.Config) {
	// CORS middleware
	router.Use(middleware.CORSMiddleware(cfg.FrontendURL))

	// Health check
	router.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok"})
	})

	// API v1 routes
	v1 := router.Group("/api/v1")
	{
		// Product routes
		productHandler := handlers.NewProductHandler(db)
		products := v1.Group("/products")
		{
			products.GET("", productHandler.GetProducts)
			products.GET("/:id", productHandler.GetProductByID)
			products.GET("/slug/:slug", productHandler.GetProductBySlug)
		}

		// Razorpay routes
		razorpayHandler := handlers.NewRazorpayHandler(db, cfg)
		razorpay := v1.Group("/razorpay")
		{
			razorpay.POST("/create-order", razorpayHandler.CreateOrder)
			razorpay.POST("/verify-payment", razorpayHandler.VerifyPayment)
		}

		// Order routes
		orderHandler := handlers.NewOrderHandler(db)
		orders := v1.Group("/orders")
		{
			orders.POST("/cod", orderHandler.CreateCODOrder)
		}

		// Admin routes (protected with API key)
		adminHandler := handlers.NewAdminHandler(db)
		admin := v1.Group("/admin")
		admin.Use(middleware.AdminAuthMiddleware())
		{
			adminProducts := admin.Group("/products")
			{
				adminProducts.POST("", adminHandler.CreateProduct)
				adminProducts.GET("", adminHandler.GetAllProducts)
				adminProducts.PUT("/:id", adminHandler.UpdateProduct)
				adminProducts.DELETE("/:id", adminHandler.DeleteProduct)
			}
			adminOrders := admin.Group("/orders")
			{
				adminOrders.GET("", adminHandler.GetAllOrders)
			}
		}
	}
}
