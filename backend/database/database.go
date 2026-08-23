package database

import (
	"fmt"
	"log"
	"time"

	"storee/backend/models"

	"gorm.io/driver/mysql"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

type Config struct {
	Host     string
	Port     string
	User     string
	Password string
	DBName   string
}

func connectWithRetry(dsn string, maxRetries int) (*gorm.DB, error) {
	var db *gorm.DB
	var err error
	delay := 2 * time.Second

	for attempt := 1; attempt <= maxRetries; attempt++ {
		db, err = gorm.Open(mysql.Open(dsn), &gorm.Config{
			Logger: logger.Default.LogMode(logger.Info),
		})
		if err == nil {
			return db, nil
		}
		log.Printf("DB connection attempt %d/%d failed: %v. Retrying in %v...", attempt, maxRetries, err, delay)
		time.Sleep(delay)
		if delay < 30*time.Second {
			delay *= 2
		}
	}
	return nil, fmt.Errorf("failed after %d attempts: %w", maxRetries, err)
}

func configurePool(db *gorm.DB) error {
	sqlDB, err := db.DB()
	if err != nil {
		return fmt.Errorf("failed to get underlying sql.DB: %w", err)
	}
	sqlDB.SetMaxOpenConns(10)
	sqlDB.SetMaxIdleConns(5)
	sqlDB.SetConnMaxLifetime(5 * time.Minute)
	sqlDB.SetConnMaxIdleTime(3 * time.Minute)
	return nil
}

func Initialize(cfg *Config) (*gorm.DB, error) {
	// First connect without database to create it if it doesn't exist
	dsnWithoutDB := fmt.Sprintf(
		"%s:%s@tcp(%s:%s)/?charset=utf8mb4&parseTime=True&loc=Local",
		cfg.User,
		cfg.Password,
		cfg.Host,
		cfg.Port,
	)

	dbWithoutDB, err := connectWithRetry(dsnWithoutDB, 10)
	if err != nil {
		return nil, fmt.Errorf("failed to connect to MySQL server: %w", err)
	}

	// Create database if it doesn't exist
	createDBQuery := fmt.Sprintf("CREATE DATABASE IF NOT EXISTS `%s` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci", cfg.DBName)
	if err := dbWithoutDB.Exec(createDBQuery).Error; err != nil {
		log.Printf("Warning: Could not create database (might already exist): %v", err)
	} else {
		log.Printf("Database '%s' ensured (created if didn't exist)", cfg.DBName)
	}

	// Close the connection without database
	sqlDB, _ := dbWithoutDB.DB()
	if sqlDB != nil {
		sqlDB.Close()
	}

	// Now connect to the specific database
	dsn := fmt.Sprintf(
		"%s:%s@tcp(%s:%s)/%s?charset=utf8mb4&parseTime=True&loc=Local",
		cfg.User,
		cfg.Password,
		cfg.Host,
		cfg.Port,
		cfg.DBName,
	)

	db, err := connectWithRetry(dsn, 10)
	if err != nil {
		return nil, fmt.Errorf("failed to connect to database: %w", err)
	}

	// Configure connection pool to handle dropped connections
	if err := configurePool(db); err != nil {
		return nil, err
	}

	log.Println("Database connected successfully")
	return db, nil
}

func Migrate(db *gorm.DB) error {
	err := db.AutoMigrate(
		&models.Product{},
		&models.ProductImage{},
		&models.Order{},
		&models.User{},
		&models.Notification{},
	)

	if err != nil {
		return fmt.Errorf("failed to migrate database: %w", err)
	}

	log.Println("Database migration completed successfully")

	if affected, err := BackfillApprovedOrders(db); err != nil {
		return fmt.Errorf("failed to backfill approved orders: %w", err)
	} else if affected > 0 {
		log.Printf("Backfilled %d order(s): approved -> processing", affected)
	}

	// Verify tables were created
	var tables []string
	if err := db.Raw("SHOW TABLES").Scan(&tables).Error; err == nil {
		log.Printf("Created tables: %v", tables)
	}

	return nil
}

// BackfillApprovedOrders converts legacy `approved` orders to `processing`.
// `approved` was removed in favor of the explicit fulfillment chain; this is a
// one-time, idempotent data fix (no-op once no approved rows remain).
func BackfillApprovedOrders(db *gorm.DB) (int64, error) {
	res := db.Model(&models.Order{}).
		Where("status = ?", "approved").
		Update("status", "processing")
	return res.RowsAffected, res.Error
}
