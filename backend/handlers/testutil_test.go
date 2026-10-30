package handlers

import (
	"bytes"
	"net/http"
	"net/http/httptest"
	"testing"

	"storee/backend/models"
	"storee/backend/services"

	"github.com/gin-gonic/gin"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

func init() {
	gin.SetMode(gin.TestMode)
}

func setupTestDB(t *testing.T) *gorm.DB {
	t.Helper()
	db, err := gorm.Open(sqlite.Open(":memory:"), &gorm.Config{})
	if err != nil {
		t.Fatalf("failed to open test db: %v", err)
	}
	if err := db.AutoMigrate(&models.User{}, &models.Product{}, &models.ProductImage{}, &models.Order{}, &models.Notification{}); err != nil {
		t.Fatalf("failed to migrate: %v", err)
	}
	return db
}

func setupTestRouter() *gin.Engine {
	return gin.New()
}

func performJSONRequest(r *gin.Engine, method, path string, body []byte, headers map[string]string) *httptest.ResponseRecorder {
	w := httptest.NewRecorder()
	req, _ := http.NewRequest(method, path, bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	for k, v := range headers {
		req.Header.Set(k, v)
	}
	r.ServeHTTP(w, req)
	return w
}

func idempotencyHeaders(key string) map[string]string {
	return map[string]string{idempotencyKeyHeader: key}
}

// testNotifier is active (credentialed, enabled) but never sends: handlers only
// write outbox rows, so assertions read the notifications table.
func testNotifier() *services.Notifier {
	return services.NewNotifier(services.NewWhatsAppClient("PHONE123", "TOKEN456", ""), []string{"9123456789"}, "en", true)
}

func queuedNotifications(t *testing.T, db *gorm.DB, orderID string) []models.Notification {
	t.Helper()
	var rows []models.Notification
	if err := db.Where("order_id = ?", orderID).Order("audience asc").Find(&rows).Error; err != nil {
		t.Fatalf("failed to read notifications: %v", err)
	}
	return rows
}
