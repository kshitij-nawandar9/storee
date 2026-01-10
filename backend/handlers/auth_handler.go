package handlers

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"

	"storee/backend/models"
	"storee/backend/utils"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type AuthHandler struct {
	DB         *gorm.DB
	JWTSecret  string
	GoogleClientID string
	GoogleSecret   string
	FrontendURL    string
}

func NewAuthHandler(db *gorm.DB, jwtSecret, googleClientID, googleSecret, frontendURL string) *AuthHandler {
	return &AuthHandler{
		DB:              db,
		JWTSecret:      jwtSecret,
		GoogleClientID: googleClientID,
		GoogleSecret:   googleSecret,
		FrontendURL:    frontendURL,
	}
}

type GoogleTokenRequest struct {
	Token string `json:"token" binding:"required"`
}

type GoogleUserInfo struct {
	ID            string `json:"id"`
	Email         string `json:"email"`
	VerifiedEmail bool   `json:"verified_email"`
	Name          string `json:"name"`
	Picture       string `json:"picture"`
}

// GoogleLogin handles Google OAuth login
func (h *AuthHandler) GoogleLogin(c *gin.Context) {
	var req GoogleTokenRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid request", err)
		return
	}

	// Verify Google token and get user info
	googleUser, err := h.verifyGoogleToken(req.Token)
	if err != nil {
		utils.ErrorResponse(c, http.StatusUnauthorized, "Invalid Google token", err)
		return
	}

	// Find or create user
	var user models.User
	result := h.DB.Where("google_id = ?", googleUser.ID).First(&user)
	
	if result.Error == gorm.ErrRecordNotFound {
		// Create new user
		user = models.User{
			GoogleID:      googleUser.ID,
			Email:         googleUser.Email,
			Name:          googleUser.Name,
			Picture:       googleUser.Picture,
			EmailVerified: googleUser.VerifiedEmail,
		}
		if err := h.DB.Create(&user).Error; err != nil {
			utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to create user", err)
			return
		}
	} else if result.Error != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Database error", result.Error)
		return
	} else {
		// Update existing user info
		user.Name = googleUser.Name
		user.Picture = googleUser.Picture
		user.EmailVerified = googleUser.VerifiedEmail
		h.DB.Save(&user)
	}

	// Generate JWT token
	token, err := utils.GenerateJWT(user.ID, user.Email, h.JWTSecret)
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to generate token", err)
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Login successful", gin.H{
		"token": token,
		"user": gin.H{
			"id":    user.ID,
			"email": user.Email,
			"name":  user.Name,
			"picture": user.Picture,
		},
	})
}

// verifyGoogleToken verifies the Google ID token (JWT) and returns user info
func (h *AuthHandler) verifyGoogleToken(token string) (*GoogleUserInfo, error) {
	// Verify JWT token with Google's tokeninfo endpoint
	url := fmt.Sprintf("https://oauth2.googleapis.com/tokeninfo?id_token=%s", token)
	resp, err := http.Get(url)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("invalid token: status %d", resp.StatusCode)
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	// Parse tokeninfo response
	var tokenInfo map[string]interface{}
	if err := json.Unmarshal(body, &tokenInfo); err != nil {
		return nil, err
	}

	// Extract user info from tokeninfo
	userInfo := &GoogleUserInfo{
		ID:            getString(tokenInfo, "sub"),
		Email:         getString(tokenInfo, "email"),
		VerifiedEmail: getBool(tokenInfo, "email_verified"),
		Name:          getString(tokenInfo, "name"),
		Picture:       getString(tokenInfo, "picture"),
	}

	if userInfo.Email == "" {
		return nil, fmt.Errorf("email not found in token")
	}

	return userInfo, nil
}

func getString(m map[string]interface{}, key string) string {
	if val, ok := m[key].(string); ok {
		return val
	}
	return ""
}

func getBool(m map[string]interface{}, key string) bool {
	if val, ok := m[key].(bool); ok {
		return val
	}
	return false
}

// GetCurrentUser returns the current authenticated user
func (h *AuthHandler) GetCurrentUser(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		utils.ErrorResponse(c, http.StatusUnauthorized, "User not authenticated", nil)
		return
	}

	var user models.User
	if err := h.DB.Where("id = ?", userID).First(&user).Error; err != nil {
		utils.ErrorResponse(c, http.StatusNotFound, "User not found", err)
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "User retrieved successfully", gin.H{
		"id":      user.ID,
		"email":   user.Email,
		"name":    user.Name,
		"picture": user.Picture,
	})
}
