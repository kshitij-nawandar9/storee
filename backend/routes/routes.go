package routes

import (
	"time"

	"storee/backend/config"
	"storee/backend/handlers"
	"storee/backend/middleware"
	"storee/backend/services"

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
		// Optional auth - links orders to user if logged in, but allows guest orders
		razorpay.Use(middleware.OptionalAuthMiddleware(cfg.JWTSecret))
		{
			razorpay.POST("/create-order", razorpayHandler.CreateOrder)
			razorpay.POST("/verify-payment", razorpayHandler.VerifyPayment)
		}
		// Webhook route (no auth required, uses signature verification instead)
		razorpayWebhook := v1.Group("/razorpay")
		{
			razorpayWebhook.POST("/webhook", razorpayHandler.HandleWebhook)
		}

		// Chatbot route (rate limited per IP — it fronts a paid LLM API)
		chatHandler := handlers.NewChatHandler(db, services.NewClaudeClient(cfg.AnthropicAPIKey, cfg.AnthropicModel))
		v1.POST("/chat", middleware.RateLimitMiddleware(20, 5*time.Minute), chatHandler.Chat)

		// Auth routes
		authHandler := handlers.NewAuthHandler(db, cfg.JWTSecret, cfg.GoogleClientID, cfg.GoogleSecret, cfg.FrontendURL)
		auth := v1.Group("/auth")
		{
			auth.POST("/google", authHandler.GoogleLogin)
			auth.GET("/me", middleware.AuthMiddleware(cfg.JWTSecret), authHandler.GetCurrentUser)
		}

		// Order routes
		orderHandler := handlers.NewOrderHandler(db)
		orders := v1.Group("/orders")
		{
			// Optional auth - links orders to user if logged in, but allows guest orders
			orders.POST("/cod", middleware.OptionalAuthMiddleware(cfg.JWTSecret), orderHandler.CreateCODOrder)
			// Protected route - requires authentication
			orders.GET("/history", middleware.AuthMiddleware(cfg.JWTSecret), orderHandler.GetOrderHistory)
		}

		// Admin routes (protected with email-based admin auth)
		adminHandler := handlers.NewAdminHandler(db)
		admin := v1.Group("/admin")
		admin.Use(middleware.AdminAuthMiddleware(cfg.JWTSecret, cfg.AdminEmails))
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
				adminOrders.PUT("/:id/status", adminHandler.UpdateOrderStatus)

				// Shiprocket delivery partner
				shippingHandler := handlers.NewShippingHandler(db, services.NewShiprocketClient(cfg.ShiprocketEmail, cfg.ShiprocketPassword), cfg.ShiprocketPickupLocation)
				adminOrders.POST("/:id/ship", shippingHandler.ShipOrder)
				adminOrders.GET("/:id/tracking", shippingHandler.GetTracking)
			}
		}
	}
}
