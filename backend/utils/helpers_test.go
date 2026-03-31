package utils

import (
	"regexp"
	"testing"
)

func TestGenerateOrderID_Format(t *testing.T) {
	id := GenerateOrderID()
	if len(id) != 10 {
		t.Errorf("GenerateOrderID() length = %d, want 10", len(id))
	}
	matched, _ := regexp.MatchString(`^[A-Z0-9]{10}$`, id)
	if !matched {
		t.Errorf("GenerateOrderID() = %q, want uppercase alphanumeric", id)
	}
}

func TestGenerateOrderID_Uniqueness(t *testing.T) {
	seen := make(map[string]bool, 1000)
	for i := 0; i < 1000; i++ {
		id := GenerateOrderID()
		if seen[id] {
			t.Fatalf("GenerateOrderID() produced duplicate: %s on iteration %d", id, i)
		}
		seen[id] = true
	}
}

func TestMustMarshalJSON_Valid(t *testing.T) {
	data := MustMarshalJSON(map[string]string{"key": "value"})
	expected := `{"key":"value"}`
	if string(data) != expected {
		t.Errorf("MustMarshalJSON() = %s, want %s", data, expected)
	}
}

func TestMustMarshalJSON_Nil(t *testing.T) {
	data := MustMarshalJSON(nil)
	if string(data) != "null" {
		t.Errorf("MustMarshalJSON(nil) = %s, want null", data)
	}
}

func TestMustMarshalJSON_Unmarshalable(t *testing.T) {
	// Channels can't be marshaled to JSON
	ch := make(chan int)
	data := MustMarshalJSON(ch)
	if string(data) != "{}" {
		t.Errorf("MustMarshalJSON(chan) = %s, want {}", data)
	}
}
