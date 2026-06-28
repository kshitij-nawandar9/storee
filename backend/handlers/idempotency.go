package handlers

import (
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"

	"storee/backend/models"
	"storee/backend/utils"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

const (
	idempotencyKeyHeader    = "Idempotency-Key"
	maxIdempotencyKeyLength = 255
)

func requireIdempotencyKey(c *gin.Context) (string, bool) {
	key := strings.TrimSpace(c.GetHeader(idempotencyKeyHeader))
	if key == "" {
		utils.ErrorResponse(c, http.StatusBadRequest, "Missing Idempotency-Key header", nil)
		return "", false
	}

	if len(key) > maxIdempotencyKeyLength {
		utils.ErrorResponse(c, http.StatusBadRequest, fmt.Sprintf("Idempotency-Key must be at most %d characters", maxIdempotencyKeyLength), nil)
		return "", false
	}

	return key, true
}

func hashOrderCreateRequest(paymentMethod string, req any) (string, error) {
	payload := struct {
		PaymentMethod string `json:"paymentMethod"`
		Request       any    `json:"request"`
	}{
		PaymentMethod: paymentMethod,
		Request:       req,
	}

	data, err := json.Marshal(payload)
	if err != nil {
		return "", err
	}

	sum := sha256.Sum256(data)
	return hex.EncodeToString(sum[:]), nil
}

func findOrderByIdempotencyKey(db *gorm.DB, key string) (*models.Order, error) {
	var order models.Order
	if err := db.Where("idempotency_key = ?", key).First(&order).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, nil
		}
		return nil, err
	}
	return &order, nil
}

func validateIdempotentOrder(c *gin.Context, order *models.Order, requestHash string) bool {
	if order.IdempotencyHash != requestHash {
		utils.ErrorResponse(c, http.StatusConflict, "Idempotency-Key was already used with different order data", nil)
		return false
	}
	return true
}
