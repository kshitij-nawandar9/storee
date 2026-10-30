package config

import (
	"os"
	"strconv"
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

	// WhatsApp Cloud API (Meta) order notifications
	NotificationsEnabled  bool     // Master kill switch for outbound notifications
	WhatsAppPhoneNumberID string   // Phone number ID of the WhatsApp Business number
	WhatsAppAccessToken   string   // System user access token with whatsapp_business_messaging
	WhatsAppAPIVersion    string   // Graph API version, e.g. "v21.0"
	WhatsAppLanguage      string   // Language code the approved templates were submitted in
	AdminWhatsAppNumbers  []string // Numbers that receive admin alerts (E.164, digits only)
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

		NotificationsEnabled:  getEnvBool("NOTIFICATIONS_ENABLED", true),
		WhatsAppPhoneNumberID: getEnv("WHATSAPP_PHONE_NUMBER_ID", ""),
		WhatsAppAccessToken:   getEnv("WHATSAPP_ACCESS_TOKEN", ""),
		WhatsAppAPIVersion:    getEnv("WHATSAPP_API_VERSION", "v21.0"),
		WhatsAppLanguage:      getEnv("WHATSAPP_TEMPLATE_LANGUAGE", "en"),
		AdminWhatsAppNumbers:  splitList(getEnv("ADMIN_WHATSAPP_NUMBERS", "")),
	}
}

// splitList parses a comma-separated env value into trimmed, non-empty entries.
func splitList(raw string) []string {
	var out []string
	for _, part := range strings.Split(raw, ",") {
		if trimmed := strings.TrimSpace(part); trimmed != "" {
			out = append(out, trimmed)
		}
	}
	return out
}

func getEnvBool(key string, defaultValue bool) bool {
	value := os.Getenv(key)
	if value == "" {
		return defaultValue
	}
	parsed, err := strconv.ParseBool(strings.TrimSpace(value))
	if err != nil {
		return defaultValue
	}
	return parsed
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}
