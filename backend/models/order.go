package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/datatypes"
)

type Order struct {
	ID            uuid.UUID      `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	OrderID       string          `json:"orderId" gorm:"uniqueIndex"` // Razorpay order ID or custom order ID
	CustomerName  string          `json:"customerName" gorm:"not null"`
	CustomerEmail string          `json:"customerEmail" gorm:"not null"`
	CustomerPhone string          `json:"customerPhone" gorm:"not null"`
	Address       datatypes.JSON  `json:"address" gorm:"type:jsonb;not null"`
	Items         datatypes.JSON  `json:"items" gorm:"type:jsonb;not null"`
	TotalAmount   int64           `json:"totalAmount" gorm:"not null"` // in paise
	Status        string          `json:"status" gorm:"default:pending"` // pending, paid, processing, shipped, delivered, cancelled
	PaymentID     string          `json:"paymentId"`                    // Razorpay payment ID
	PaymentMethod string          `json:"paymentMethod" gorm:"not null"` // razorpay or cod
	CreatedAt     time.Time       `json:"createdAt"`
	UpdatedAt     time.Time       `json:"updatedAt"`
}
