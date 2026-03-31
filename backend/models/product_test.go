package models

import (
	"encoding/json"
	"testing"
)

func TestStringArray_Value_NonEmpty(t *testing.T) {
	sa := StringArray{"feature1", "feature2"}
	val, err := sa.Value()
	if err != nil {
		t.Fatalf("Value() error = %v", err)
	}
	bytes, ok := val.([]byte)
	if !ok {
		t.Fatalf("Value() type = %T, want []byte", val)
	}
	var result []string
	if err := json.Unmarshal(bytes, &result); err != nil {
		t.Fatalf("Unmarshal error = %v", err)
	}
	if len(result) != 2 || result[0] != "feature1" || result[1] != "feature2" {
		t.Errorf("Value() round-trip = %v, want [feature1 feature2]", result)
	}
}

func TestStringArray_Value_Empty(t *testing.T) {
	sa := StringArray{}
	val, err := sa.Value()
	if err != nil {
		t.Fatalf("Value() error = %v", err)
	}
	if val != "[]" {
		t.Errorf("Value() = %v, want []", val)
	}
}

func TestStringArray_Scan_Nil(t *testing.T) {
	var sa StringArray
	if err := sa.Scan(nil); err != nil {
		t.Fatalf("Scan(nil) error = %v", err)
	}
	if len(sa) != 0 {
		t.Errorf("Scan(nil) length = %d, want 0", len(sa))
	}
}

func TestStringArray_Scan_ValidJSON(t *testing.T) {
	var sa StringArray
	if err := sa.Scan([]byte(`["a","b","c"]`)); err != nil {
		t.Fatalf("Scan() error = %v", err)
	}
	if len(sa) != 3 || sa[0] != "a" || sa[1] != "b" || sa[2] != "c" {
		t.Errorf("Scan() = %v, want [a b c]", sa)
	}
}

func TestStringArray_Scan_InvalidType(t *testing.T) {
	var sa StringArray
	// Passing an int — not []byte, so the type assertion fails and returns nil
	err := sa.Scan(12345)
	if err != nil {
		t.Errorf("Scan(int) error = %v, want nil (silent ignore)", err)
	}
}

func TestStringArray_RoundTrip(t *testing.T) {
	original := StringArray{"x", "y", "z"}
	val, err := original.Value()
	if err != nil {
		t.Fatalf("Value() error = %v", err)
	}
	var scanned StringArray
	if err := scanned.Scan(val); err != nil {
		t.Fatalf("Scan() error = %v", err)
	}
	if len(scanned) != len(original) {
		t.Fatalf("RoundTrip length = %d, want %d", len(scanned), len(original))
	}
	for i := range original {
		if scanned[i] != original[i] {
			t.Errorf("RoundTrip[%d] = %q, want %q", i, scanned[i], original[i])
		}
	}
}
