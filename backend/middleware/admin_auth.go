package middleware

import (
	"net/http"
	"strings"

	"storee/backend/utils"

	"github.com/gin-gonic/gin"
)

// AdminAuthMiddleware validates that the user is authenticated via JWT and has an admin email
func AdminAuthMiddleware(jwtSecret string, adminEmails []string) gin.HandlerFunc {
	return func(c *gin.Context) {
		// First, validate JWT token (same as AuthMiddleware)
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			utils.ErrorResponse(c, http.StatusUnauthorized, "Authorization header required", nil)
			c.Abort()
			return
		}

		// Extract token from "Bearer <token>"
		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || parts[0] != "Bearer" {
			utils.ErrorResponse(c, http.StatusUnauthorized, "Invalid authorization header format", nil)
			c.Abort()
			return
		}

		token := parts[1]
		claims, err := utils.ValidateJWT(token, jwtSecret)
		if err != nil {
			utils.ErrorResponse(c, http.StatusUnauthorized, "Invalid or expired token", nil)
			c.Abort()
			return
		}

		// Check if user email is in admin list
		userEmail := strings.ToLower(strings.TrimSpace(claims.Email))
		isAdmin := false
		for _, adminEmail := range adminEmails {
			if strings.ToLower(strings.TrimSpace(adminEmail)) == userEmail {
				isAdmin = true
				break
			}
		}

		if !isAdmin {
			utils.ErrorResponse(c, http.StatusForbidden, "Access denied. Admin privileges required.", nil)
			c.Abort()
			return
		}

		// Set user info in context (same as AuthMiddleware)
		c.Set("userID", claims.UserID)
		c.Set("userEmail", claims.Email)

		c.Next()
	}
}
