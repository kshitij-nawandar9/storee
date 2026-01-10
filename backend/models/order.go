package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/datatypes"
	"gorm.io/gorm"
)

type Order struct {
	ID            uuid.UUID     `json:"id" gorm:"type:char(36);primary_key"`
	OrderID       string        `json:"orderId" gorm:"type:varchar(255);uniqueIndex"` // Razorpay order ID or custom order ID
	CustomerName  string        `json:"customerName" gorm:"type:varchar(255);not null"`
	CustomerEmail string        `json:"customerEmail" gorm:"type:varchar(255);not null"`
	CustomerPhone string        `json:"customerPhone" gorm:"type:varchar(20);not null"`
	Address       datatypes.JSON `json:"address" gorm:"type:json;not null"`
	Items         datatypes.JSON `json:"items" gorm:"type:json;not null"`
	TotalAmount   int64         `json:"totalAmount" gorm:"not null"` // in paise
	Status        string        `json:"status" gorm:"type:varchar(50);default:pending"` // pending, paid, processing, shipped, delivered, cancelled
	PaymentID     string        `json:"paymentId" gorm:"type:varchar(255)"`                    // Razorpay payment ID
	PaymentMethod string        `json:"paymentMethod" gorm:"type:varchar(50);not null"` // razorpay or cod
	CreatedAt     time.Time     `json:"createdAt"`
	UpdatedAt     time.Time     `json:"updatedAt"`
}

// BeforeCreate hook to generate UUID
func (o *Order) BeforeCreate(tx *gorm.DB) error {
	if o.ID == uuid.Nil {
		o.ID = uuid.New()
	}
	return nil
}
