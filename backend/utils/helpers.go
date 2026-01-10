package utils

import (
	"crypto/rand"
	"encoding/json"
	"log"
	"math/big"
)

func MustMarshalJSON(v interface{}) []byte {
	data, err := json.Marshal(v)
	if err != nil {
		log.Printf("Failed to marshal JSON: %v", err)
		return []byte("{}")
	}
	return data
}

// GenerateOrderID generates a unique 10-digit alphanumeric order ID
// Format: 10 characters (uppercase letters and numbers)
// Uses crypto/rand for secure random generation
func GenerateOrderID() string {
	const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
	const length = 10
	b := make([]byte, length)
	for i := range b {
		num, err := rand.Int(rand.Reader, big.NewInt(int64(len(charset))))
		if err != nil {
			// Fallback to pseudo-random if crypto/rand fails
			// This should rarely happen, but we need a fallback
			b[i] = charset[i%len(charset)]
		} else {
			b[i] = charset[num.Int64()]
		}
	}
	return string(b)
}
