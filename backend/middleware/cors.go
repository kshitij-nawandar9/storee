package middleware

import (
	"strings"

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

	// Add frontend URL(s) if provided
	// Supports comma-separated list of URLs
	if frontendURL != "" {
		urls := strings.Split(frontendURL, ",")
		for _, url := range urls {
			url = strings.TrimSpace(url)
			if url != "" {
				allowedOrigins = append(allowedOrigins, url)
				// Also handle trailing slash variations
				if url[len(url)-1] == '/' {
					allowedOrigins = append(allowedOrigins, url[:len(url)-1])
				} else {
					allowedOrigins = append(allowedOrigins, url+"/")
				}
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
