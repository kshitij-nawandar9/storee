package config

import (
	"os"
)

type Config struct {
	Port            string
	Env             string
	DBHost          string
	DBPort          string
	DBUser          string
	DBPassword      string
	DBName          string
	RazorpayKeyID   string
	RazorpaySecret  string
	FrontendURL     string
}

func Load() *Config {
	return &Config{
		Port:            getEnv("PORT", "8080"),
		Env:             getEnv("ENV", "development"),
		DBHost:          getEnv("DB_HOST", "localhost"),
		DBPort:          getEnv("DB_PORT", "5432"),
		DBUser:          getEnv("DB_USER", "postgres"),
		DBPassword:      getEnv("DB_PASSWORD", ""),
		DBName:          getEnv("DB_NAME", "storee"),
		RazorpayKeyID:   getEnv("RAZORPAY_KEY_ID", ""),
		RazorpaySecret:  getEnv("RAZORPAY_KEY_SECRET", ""),
		FrontendURL:     getEnv("FRONTEND_URL", "http://localhost:5173"),
	}
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}
