package utils

import "testing"

func TestNormalizeIndianPhone(t *testing.T) {
	tests := []struct {
		name  string
		raw   string
		want  string
		valid bool
	}{
		{"plain ten digits", "9876543210", "919876543210", true},
		{"with country code and spaces", "+91 98765 43210", "919876543210", true},
		{"with trunk zero", "09876543210", "919876543210", true},
		{"country code without plus", "919876543210", "919876543210", true},
		{"plus zero country code", "+0919876543210", "919876543210", true},
		{"punctuation", "(+91) 98765-43210", "919876543210", true},
		{"landline rejected", "2226543210", "", false},
		{"too short", "98765", "", false},
		{"too long", "98765432109876", "", false},
		{"empty", "", "", false},
		{"letters only", "not-a-number", "", false},
		{"ten digits starting with five", "5876543210", "", false},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got, ok := NormalizeIndianPhone(tt.raw)
			if ok != tt.valid {
				t.Fatalf("ok = %v, want %v (got %q)", ok, tt.valid, got)
			}
			if got != tt.want {
				t.Errorf("got %q, want %q", got, tt.want)
			}
		})
	}
}

func TestFormatINR(t *testing.T) {
	tests := []struct {
		paise int64
		want  string
	}{
		{0, "0"},
		{50, "0.50"},
		{100, "1"},
		{129900, "1,299"},
		{129950, "1,299.50"},
		{100000000, "10,00,000"},
		{123456789, "12,34,567.89"},
		{-129900, "-1,299"},
	}

	for _, tt := range tests {
		if got := FormatINR(tt.paise); got != tt.want {
			t.Errorf("FormatINR(%d) = %q, want %q", tt.paise, got, tt.want)
		}
	}
}
