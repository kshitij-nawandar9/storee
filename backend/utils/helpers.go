package utils

import (
	"encoding/json"
	"log"
)

func MustMarshalJSON(v interface{}) []byte {
	data, err := json.Marshal(v)
	if err != nil {
		log.Printf("Failed to marshal JSON: %v", err)
		return []byte("{}")
	}
	return data
}
