package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type User struct {
	ID            uuid.UUID `json:"id" gorm:"type:char(36);primary_key"`
	GoogleID      string    `json:"googleId" gorm:"type:varchar(255);uniqueIndex;not null"`
	Email         string    `json:"email" gorm:"type:varchar(255);uniqueIndex;not null"`
	Name          string    `json:"name" gorm:"type:varchar(255);not null"`
	Picture       string    `json:"picture" gorm:"type:text"`
	EmailVerified bool      `json:"emailVerified" gorm:"default:false"`
	CreatedAt     time.Time `json:"createdAt"`
	UpdatedAt     time.Time `json:"updatedAt"`
}

// BeforeCreate hook to generate UUID
func (u *User) BeforeCreate(tx *gorm.DB) error {
	if u.ID == uuid.Nil {
		u.ID = uuid.New()
	}
	return nil
}
