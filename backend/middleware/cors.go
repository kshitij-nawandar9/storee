package middleware

import (
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func CORSMiddleware(frontendURL string) gin.HandlerFunc {
	config := cors.DefaultConfig()
	
	// Build allowed origins list
	allowedOrigins := []string{
		"http://localhost:5173",
		"http://localhost:3000",
	}
	
	// Add frontend URL if provided
	if frontendURL != "" {
		allowedOrigins = append(allowedOrigins, frontendURL)
		// Also handle trailing slash variations for production URLs
		if len(frontendURL) > 0 {
			if frontendURL[len(frontendURL)-1] == '/' {
				allowedOrigins = append(allowedOrigins, frontendURL[:len(frontendURL)-1])
			} else {
				allowedOrigins = append(allowedOrigins, frontendURL+"/")
			}
		}
	}
	
	config.AllowOrigins = allowedOrigins
	config.AllowMethods = []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"}
	config.AllowHeaders = []string{"Origin", "Content-Type", "Accept", "Authorization", "X-API-Key"}
	config.AllowCredentials = true
	config.ExposeHeaders = []string{"Content-Length"}

	return cors.New(config)
}
