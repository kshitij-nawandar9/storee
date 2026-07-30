package config

import (
	"testing"
)

func TestLoad_Defaults(t *testing.T) {
	cfg := Load()

	checks := map[string]struct{ got, want string }{
		"Port":      {cfg.Port, "8080"},
		"Env":       {cfg.Env, "development"},
		"DBHost":    {cfg.DBHost, "localhost"},
		"DBPort":    {cfg.DBPort, "3306"},
		"DBUser":    {cfg.DBUser, "root"},
		"DBName":    {cfg.DBName, "storee"},
		"JWTSecret": {cfg.JWTSecret, "your-secret-key-change-in-production"},
	}
	for name, tc := range checks {
		if tc.got != tc.want {
			t.Errorf("%s = %q, want %q", name, tc.got, tc.want)
		}
	}

	if len(cfg.AdminEmails) != 3 {
		t.Fatalf("AdminEmails length = %d, want 3", len(cfg.AdminEmails))
	}
	if cfg.AdminEmails[0] != "thestoree.in@gmail.com" {
		t.Errorf("AdminEmails[0] = %q, want thestoree.in@gmail.com", cfg.AdminEmails[0])
	}
}

func TestLoad_EnvOverrides(t *testing.T) {
	t.Setenv("PORT", "9090")
	t.Setenv("ENV", "production")
	t.Setenv("DB_HOST", "db.example.com")
	t.Setenv("JWT_SECRET", "super-secret")

	cfg := Load()

	if cfg.Port != "9090" {
		t.Errorf("Port = %q, want 9090", cfg.Port)
	}
	if cfg.Env != "production" {
		t.Errorf("Env = %q, want production", cfg.Env)
	}
	if cfg.DBHost != "db.example.com" {
		t.Errorf("DBHost = %q, want db.example.com", cfg.DBHost)
	}
	if cfg.JWTSecret != "super-secret" {
		t.Errorf("JWTSecret = %q, want super-secret", cfg.JWTSecret)
	}
}

func TestLoad_AdminEmailsParsing(t *testing.T) {
	t.Setenv("ADMIN_EMAILS", " admin@test.com , boss@test.com , ceo@test.com ")

	cfg := Load()

	if len(cfg.AdminEmails) != 3 {
		t.Fatalf("AdminEmails length = %d, want 3", len(cfg.AdminEmails))
	}
	expected := []string{"admin@test.com", "boss@test.com", "ceo@test.com"}
	for i, want := range expected {
		if cfg.AdminEmails[i] != want {
			t.Errorf("AdminEmails[%d] = %q, want %q", i, cfg.AdminEmails[i], want)
		}
	}
}
