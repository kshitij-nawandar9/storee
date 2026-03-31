package utils

import (
	"testing"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
)

const testSecret = "test-secret-key"

func TestGenerateAndValidateJWT(t *testing.T) {
	userID := uuid.New()
	email := "test@example.com"

	token, err := GenerateJWT(userID, email, testSecret)
	if err != nil {
		t.Fatalf("GenerateJWT() error = %v", err)
	}
	if token == "" {
		t.Fatal("GenerateJWT() returned empty token")
	}

	claims, err := ValidateJWT(token, testSecret)
	if err != nil {
		t.Fatalf("ValidateJWT() error = %v", err)
	}
	if claims.UserID != userID {
		t.Errorf("UserID = %v, want %v", claims.UserID, userID)
	}
	if claims.Email != email {
		t.Errorf("Email = %v, want %v", claims.Email, email)
	}
	if claims.Issuer != "storee" {
		t.Errorf("Issuer = %v, want storee", claims.Issuer)
	}
}

func TestValidateJWT_WrongSecret(t *testing.T) {
	userID := uuid.New()
	token, _ := GenerateJWT(userID, "test@example.com", testSecret)

	_, err := ValidateJWT(token, "wrong-secret")
	if err == nil {
		t.Error("ValidateJWT() with wrong secret should return error")
	}
}

func TestValidateJWT_MalformedToken(t *testing.T) {
	_, err := ValidateJWT("not.a.valid.token", testSecret)
	if err == nil {
		t.Error("ValidateJWT() with malformed token should return error")
	}
}

func TestValidateJWT_EmptyToken(t *testing.T) {
	_, err := ValidateJWT("", testSecret)
	if err == nil {
		t.Error("ValidateJWT() with empty token should return error")
	}
}

func TestValidateJWT_ExpiredToken(t *testing.T) {
	userID := uuid.New()
	claims := &Claims{
		UserID: userID,
		Email:  "test@example.com",
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(-1 * time.Hour)),
			IssuedAt:  jwt.NewNumericDate(time.Now().Add(-2 * time.Hour)),
			NotBefore: jwt.NewNumericDate(time.Now().Add(-2 * time.Hour)),
			Issuer:    "storee",
		},
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, _ := token.SignedString([]byte(testSecret))

	_, err := ValidateJWT(tokenString, testSecret)
	if err == nil {
		t.Error("ValidateJWT() with expired token should return error")
	}
}

func TestValidateJWT_WrongSigningMethod(t *testing.T) {
	// Create a token with HMAC but tamper to look like it has a different method
	// The simplest way: create a none-signed token
	claims := &Claims{
		UserID: uuid.New(),
		Email:  "test@example.com",
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(time.Hour)),
			Issuer:    "storee",
		},
	}
	token := jwt.NewWithClaims(jwt.SigningMethodNone, claims)
	tokenString, _ := token.SignedString(jwt.UnsafeAllowNoneSignatureType)

	_, err := ValidateJWT(tokenString, testSecret)
	if err == nil {
		t.Error("ValidateJWT() with 'none' signing method should return error")
	}
}
