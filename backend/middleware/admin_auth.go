package middleware

import (
	"net/http"
	"os"

	"storee/backend/utils"

	"github.com/gin-gonic/gin"
)

// AdminAuthMiddleware validates admin API key
func AdminAuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Get API key from header
		apiKey := c.GetHeader("X-API-Key")
		if apiKey == "" {
			utils.ErrorResponse(c, http.StatusUnauthorized, "API key required", nil)
			c.Abort()
			return
		}

		// Get admin API key from environment
		adminAPIKey := os.Getenv("ADMIN_API_KEY")
		if adminAPIKey == "" {
			// Default key for development (should be set in production)
			adminAPIKey = "dev-admin-key-change-in-production"
		}

		// Validate API key
		if apiKey != adminAPIKey {
			utils.ErrorResponse(c, http.StatusForbidden, "Invalid API key", nil)
			c.Abort()
			return
		}

		c.Next()
	}
}
