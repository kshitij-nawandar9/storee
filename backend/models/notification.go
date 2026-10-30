package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/datatypes"
	"gorm.io/gorm"
)

// Notification delivery states.
const (
	NotificationQueued  = "queued"
	NotificationSending = "sending"
	NotificationSent    = "sent"
	NotificationFailed  = "failed"
)

// Notification is one outbound message to one recipient on one channel.
//
// Handlers enqueue rows in the same request that changes an order and the
// notification worker does the sending, so a provider outage can never fail
// checkout and a deploy restart can never silently drop a message.
type Notification struct {
	ID        uuid.UUID `json:"id" gorm:"type:char(36);primary_key"`
	OrderID   string    `json:"orderId" gorm:"type:varchar(20);index"`
	Event     string    `json:"event" gorm:"type:varchar(50);not null"`
	Channel   string    `json:"channel" gorm:"type:varchar(20);not null"`  // whatsapp (email later)
	Audience  string    `json:"audience" gorm:"type:varchar(20);not null"` // customer | admin
	Recipient string    `json:"recipient" gorm:"type:varchar(255);not null"`

	// DedupeKey is order+event+channel+recipient. Its unique index is what makes
	// enqueueing idempotent: VerifyPayment and the Razorpay webhook both mark an
	// order paid, and the second insert must be a no-op rather than a second
	// "payment received" message to the customer.
	DedupeKey string `json:"-" gorm:"type:varchar(191);uniqueIndex;not null"`

	// Payload holds the rendered template name and parameters, so the worker
	// never re-reads the order and message content stays fixed at enqueue time.
	Payload datatypes.JSON `json:"payload" gorm:"type:json;not null"`

	Status            string     `json:"status" gorm:"type:varchar(20);index;default:queued"`
	Attempts          int        `json:"attempts" gorm:"not null;default:0"`
	LastError         string     `json:"lastError" gorm:"type:text"`
	ProviderMessageID string     `json:"providerMessageId" gorm:"type:varchar(128)"`
	NextRunAt         time.Time  `json:"nextRunAt" gorm:"index"`
	SentAt            *time.Time `json:"sentAt"`
	CreatedAt         time.Time  `json:"createdAt"`
	UpdatedAt         time.Time  `json:"updatedAt"`
}

// BeforeCreate hook to generate UUID
func (n *Notification) BeforeCreate(tx *gorm.DB) error {
	if n.ID == uuid.Nil {
		n.ID = uuid.New()
	}
	return nil
}
