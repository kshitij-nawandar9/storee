package database

import (
	"fmt"
	"log"

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

func Initialize(cfg *Config) (*gorm.DB, error) {
	// First connect without database to create it if it doesn't exist
	dsnWithoutDB := fmt.Sprintf(
		"%s:%s@tcp(%s:%s)/?charset=utf8mb4&parseTime=True&loc=Local",
		cfg.User,
		cfg.Password,
		cfg.Host,
		cfg.Port,
	)

	dbWithoutDB, err := gorm.Open(mysql.Open(dsnWithoutDB), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
	})
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

	db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
	})

	if err != nil {
		return nil, fmt.Errorf("failed to connect to database: %w", err)
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
	)

	if err != nil {
		return fmt.Errorf("failed to migrate database: %w", err)
	}

	log.Println("Database migration completed successfully")
	
	// Verify tables were created
	var tables []string
	if err := db.Raw("SHOW TABLES").Scan(&tables).Error; err == nil {
		log.Printf("Created tables: %v", tables)
	}
	
	return nil
}
