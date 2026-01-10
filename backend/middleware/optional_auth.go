package middleware

import (
	"strings"

	"storee/backend/utils"

	"github.com/gin-gonic/gin"
)

// OptionalAuthMiddleware validates JWT token if present, but doesn't require it
// This allows routes to work for both authenticated and guest users
func OptionalAuthMiddleware(jwtSecret string) gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		
		// If no auth header, continue without setting user info
		if authHeader == "" {
			c.Next()
			return
		}

		// Extract token from "Bearer <token>"
		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || parts[0] != "Bearer" {
			c.Next()
			return
		}

		token := parts[1]
		claims, err := utils.ValidateJWT(token, jwtSecret)
		if err != nil {
			// Invalid token, but continue anyway (guest user)
			c.Next()
			return
		}

		// Valid token - set user info in context
		c.Set("userID", claims.UserID)
		c.Set("userEmail", claims.Email)

		c.Next()
	}
}
