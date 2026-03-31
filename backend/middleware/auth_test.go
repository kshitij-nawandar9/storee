package middleware

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"storee/backend/utils"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

const testJWTSecret = "test-jwt-secret"

func init() {
	gin.SetMode(gin.TestMode)
}

func setupRouter(middlewareFn gin.HandlerFunc) *gin.Engine {
	r := gin.New()
	r.Use(middlewareFn)
	r.GET("/test", func(c *gin.Context) {
		userID, _ := c.Get("userID")
		email, _ := c.Get("userEmail")
		c.JSON(http.StatusOK, gin.H{"userID": userID, "email": email})
	})
	return r
}

func performRequest(r *gin.Engine, method, path string, headers map[string]string) *httptest.ResponseRecorder {
	w := httptest.NewRecorder()
	req, _ := http.NewRequest(method, path, nil)
	for k, v := range headers {
		req.Header.Set(k, v)
	}
	r.ServeHTTP(w, req)
	return w
}

// --- AuthMiddleware Tests ---

func TestAuthMiddleware_NoHeader(t *testing.T) {
	r := setupRouter(AuthMiddleware(testJWTSecret))
	w := performRequest(r, "GET", "/test", nil)
	if w.Code != http.StatusUnauthorized {
		t.Errorf("status = %d, want %d", w.Code, http.StatusUnauthorized)
	}
}

func TestAuthMiddleware_InvalidFormat(t *testing.T) {
	r := setupRouter(AuthMiddleware(testJWTSecret))
	w := performRequest(r, "GET", "/test", map[string]string{
		"Authorization": "InvalidFormat",
	})
	if w.Code != http.StatusUnauthorized {
		t.Errorf("status = %d, want %d", w.Code, http.StatusUnauthorized)
	}
}

func TestAuthMiddleware_InvalidToken(t *testing.T) {
	r := setupRouter(AuthMiddleware(testJWTSecret))
	w := performRequest(r, "GET", "/test", map[string]string{
		"Authorization": "Bearer invalid.token.here",
	})
	if w.Code != http.StatusUnauthorized {
		t.Errorf("status = %d, want %d", w.Code, http.StatusUnauthorized)
	}
}

func TestAuthMiddleware_ValidToken(t *testing.T) {
	userID := uuid.New()
	token, _ := utils.GenerateJWT(userID, "user@test.com", testJWTSecret)

	r := setupRouter(AuthMiddleware(testJWTSecret))
	w := performRequest(r, "GET", "/test", map[string]string{
		"Authorization": "Bearer " + token,
	})
	if w.Code != http.StatusOK {
		t.Errorf("status = %d, want %d", w.Code, http.StatusOK)
	}
}

// --- AdminAuthMiddleware Tests ---

func TestAdminAuthMiddleware_ValidAdmin(t *testing.T) {
	adminEmail := "admin@test.com"
	userID := uuid.New()
	token, _ := utils.GenerateJWT(userID, adminEmail, testJWTSecret)

	r := setupRouter(AdminAuthMiddleware(testJWTSecret, []string{adminEmail}))
	w := performRequest(r, "GET", "/test", map[string]string{
		"Authorization": "Bearer " + token,
	})
	if w.Code != http.StatusOK {
		t.Errorf("status = %d, want %d", w.Code, http.StatusOK)
	}
}

func TestAdminAuthMiddleware_NonAdmin(t *testing.T) {
	userID := uuid.New()
	token, _ := utils.GenerateJWT(userID, "regular@test.com", testJWTSecret)

	r := setupRouter(AdminAuthMiddleware(testJWTSecret, []string{"admin@test.com"}))
	w := performRequest(r, "GET", "/test", map[string]string{
		"Authorization": "Bearer " + token,
	})
	if w.Code != http.StatusForbidden {
		t.Errorf("status = %d, want %d", w.Code, http.StatusForbidden)
	}
}

func TestAdminAuthMiddleware_CaseInsensitive(t *testing.T) {
	userID := uuid.New()
	token, _ := utils.GenerateJWT(userID, "Admin@Test.COM", testJWTSecret)

	r := setupRouter(AdminAuthMiddleware(testJWTSecret, []string{"admin@test.com"}))
	w := performRequest(r, "GET", "/test", map[string]string{
		"Authorization": "Bearer " + token,
	})
	if w.Code != http.StatusOK {
		t.Errorf("status = %d, want %d (case-insensitive match)", w.Code, http.StatusOK)
	}
}

func TestAdminAuthMiddleware_NoHeader(t *testing.T) {
	r := setupRouter(AdminAuthMiddleware(testJWTSecret, []string{"admin@test.com"}))
	w := performRequest(r, "GET", "/test", nil)
	if w.Code != http.StatusUnauthorized {
		t.Errorf("status = %d, want %d", w.Code, http.StatusUnauthorized)
	}
}

// --- OptionalAuthMiddleware Tests ---

func TestOptionalAuthMiddleware_NoHeader(t *testing.T) {
	r := setupRouter(OptionalAuthMiddleware(testJWTSecret))
	w := performRequest(r, "GET", "/test", nil)
	if w.Code != http.StatusOK {
		t.Errorf("status = %d, want %d (should pass through)", w.Code, http.StatusOK)
	}
}

func TestOptionalAuthMiddleware_InvalidToken(t *testing.T) {
	r := setupRouter(OptionalAuthMiddleware(testJWTSecret))
	w := performRequest(r, "GET", "/test", map[string]string{
		"Authorization": "Bearer bad.token",
	})
	if w.Code != http.StatusOK {
		t.Errorf("status = %d, want %d (should pass through on invalid)", w.Code, http.StatusOK)
	}
}

func TestOptionalAuthMiddleware_ValidToken(t *testing.T) {
	userID := uuid.New()
	token, _ := utils.GenerateJWT(userID, "user@test.com", testJWTSecret)

	r := setupRouter(OptionalAuthMiddleware(testJWTSecret))
	w := performRequest(r, "GET", "/test", map[string]string{
		"Authorization": "Bearer " + token,
	})
	if w.Code != http.StatusOK {
		t.Errorf("status = %d, want %d", w.Code, http.StatusOK)
	}
}
