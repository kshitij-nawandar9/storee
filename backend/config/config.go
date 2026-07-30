package config

import (
	"os"
	"strings"
)

type Config struct {
	Port           string
	Env            string
	DBHost         string
	DBPort         string
	DBUser         string
	DBPassword     string
	DBName         string
	RazorpayKeyID  string
	RazorpaySecret string
	FrontendURL    string
	GoogleClientID string
	GoogleSecret   string
	JWTSecret      string
	AdminEmails    []string // List of admin email addresses

	// Shiprocket delivery partner integration
	ShiprocketEmail          string // API user email (create under Settings > API in Shiprocket)
	ShiprocketPassword       string // API user password
	ShiprocketPickupLocation string // Pickup location nickname configured in Shiprocket
}

func Load() *Config {
	// Get admin emails from environment or use defaults
	adminEmailsEnv := getEnv("ADMIN_EMAILS", "thestoree.in@gmail.com,nawandar.kshitij@gmail.com")
	adminEmails := strings.Split(adminEmailsEnv, ",")
	// Trim whitespace from each email
	for i := range adminEmails {
		adminEmails[i] = strings.TrimSpace(adminEmails[i])
	}

	return &Config{
		Port:           getEnv("PORT", "8080"),
		Env:            getEnv("ENV", "development"),
		DBHost:         getEnv("DB_HOST", "localhost"),
		DBPort:         getEnv("DB_PORT", "3306"),
		DBUser:         getEnv("DB_USER", "root"),
		DBPassword:     getEnv("DB_PASSWORD", ""),
		DBName:         getEnv("DB_NAME", "storee"),
		RazorpayKeyID:  getEnv("RAZORPAY_KEY_ID", ""),
		RazorpaySecret: getEnv("RAZORPAY_KEY_SECRET", ""),
		FrontendURL:    getEnv("FRONTEND_URL", "http://localhost:5173"),
		GoogleClientID: getEnv("GOOGLE_CLIENT_ID", ""),
		GoogleSecret:   getEnv("GOOGLE_CLIENT_SECRET", ""),
		JWTSecret:      getEnv("JWT_SECRET", "your-secret-key-change-in-production"),
		AdminEmails:    adminEmails,

		ShiprocketEmail:          getEnv("SHIPROCKET_EMAIL", ""),
		ShiprocketPassword:       getEnv("SHIPROCKET_PASSWORD", ""),
		ShiprocketPickupLocation: getEnv("SHIPROCKET_PICKUP_LOCATION", "Primary"),
	}
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}
