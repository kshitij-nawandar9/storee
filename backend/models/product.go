package models

import (
	"database/sql/driver"
	"encoding/json"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// StringArray is a custom type for MySQL JSON array storage
type StringArray []string

// Value implements the driver.Valuer interface
func (a StringArray) Value() (driver.Value, error) {
	if len(a) == 0 {
		return "[]", nil
	}
	return json.Marshal(a)
}

// Scan implements the sql.Scanner interface
func (a *StringArray) Scan(value interface{}) error {
	if value == nil {
		*a = []string{}
		return nil
	}
	bytes, ok := value.([]byte)
	if !ok {
		return nil
	}
	return json.Unmarshal(bytes, a)
}

type Product struct {
	ID          uuid.UUID      `json:"id" gorm:"type:char(36);primary_key"`
	Name        string         `json:"name" gorm:"type:varchar(255);not null"`
	Slug        string         `json:"slug" gorm:"type:varchar(255);uniqueIndex;not null"`
	Description string         `json:"description" gorm:"type:text"`
	BasePrice   int64          `json:"basePrice" gorm:"not null"` // in paise
	Category    string         `json:"category" gorm:"type:varchar(100);not null"`
	Stock       *int           `json:"stock"` // nullable for products with variants
	IsActive    bool           `json:"isActive" gorm:"default:true"`
	Features    StringArray    `json:"features" gorm:"type:json"`
	Images      []ProductImage `json:"images" gorm:"foreignKey:ProductID;constraint:OnDelete:CASCADE"`
	CreatedAt   time.Time      `json:"createdAt"`
	UpdatedAt   time.Time      `json:"updatedAt"`
	DeletedAt   gorm.DeletedAt `json:"-" gorm:"index"`
}

// BeforeCreate hook to generate UUID
func (p *Product) BeforeCreate(tx *gorm.DB) error {
	if p.ID == uuid.Nil {
		p.ID = uuid.New()
	}
	return nil
}

type ProductImage struct {
	ID        uuid.UUID `json:"id" gorm:"type:char(36);primary_key"`
	ProductID uuid.UUID `json:"productId" gorm:"type:char(36);not null;index"`
	URL       string    `json:"url" gorm:"not null"`
	AltText   string    `json:"altText"`
	Order     int       `json:"order" gorm:"default:0"`
	IsPrimary bool      `json:"isPrimary" gorm:"default:false"`
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
}

// BeforeCreate hook to generate UUID
func (pi *ProductImage) BeforeCreate(tx *gorm.DB) error {
	if pi.ID == uuid.Nil {
		pi.ID = uuid.New()
	}
	return nil
}
