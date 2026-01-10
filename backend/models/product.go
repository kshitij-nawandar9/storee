package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Product struct {
	ID          uuid.UUID      `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	Name        string         `json:"name" gorm:"not null"`
	Slug        string         `json:"slug" gorm:"uniqueIndex;not null"`
	Description string         `json:"description" gorm:"type:text"`
	BasePrice   int64          `json:"basePrice" gorm:"not null"` // in paise
	Category    string         `json:"category" gorm:"not null"`
	Stock       *int           `json:"stock"` // nullable for products with variants
	IsActive    bool           `json:"isActive" gorm:"default:true"`
	Features    []string       `json:"features" gorm:"type:text[]"`
	Images      []ProductImage `json:"images" gorm:"foreignKey:ProductID;constraint:OnDelete:CASCADE"`
	CreatedAt   time.Time      `json:"createdAt"`
	UpdatedAt   time.Time      `json:"updatedAt"`
	DeletedAt   gorm.DeletedAt `json:"-" gorm:"index"`
}

type ProductImage struct {
	ID        uuid.UUID `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	ProductID uuid.UUID `json:"productId" gorm:"type:uuid;not null;index"`
	URL       string    `json:"url" gorm:"not null"`
	AltText   string    `json:"altText"`
	Order     int       `json:"order" gorm:"default:0"`
	IsPrimary bool      `json:"isPrimary" gorm:"default:false"`
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
}
