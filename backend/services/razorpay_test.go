package services

import (
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
)

func TestCreateOrder_Success(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		fmt.Fprintf(w, `{"id":"order_123","entity":"order","amount":50000,"currency":"INR","receipt":"receipt_ABC","status":"created","created_at":1234567890}`)
	}))
	defer server.Close()

	client := NewRazorpayClient("key_test", "secret_test")
	client.BaseURL = server.URL

	resp, err := client.CreateOrder(50000, "receipt_ABC")
	if err != nil {
		t.Fatalf("CreateOrder() error = %v", err)
	}
	if resp.ID != "order_123" {
		t.Errorf("ID = %q, want order_123", resp.ID)
	}
	if resp.Amount != 50000 {
		t.Errorf("Amount = %d, want 50000", resp.Amount)
	}
	if resp.Currency != "INR" {
		t.Errorf("Currency = %q, want INR", resp.Currency)
	}
}

func TestCreateOrder_AuthHeader(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		authHeader := r.Header.Get("Authorization")
		if !strings.HasPrefix(authHeader, "Basic ") {
			t.Errorf("Authorization header = %q, want Basic prefix", authHeader)
		}

		decoded, err := base64.StdEncoding.DecodeString(strings.TrimPrefix(authHeader, "Basic "))
		if err != nil {
			t.Fatalf("Failed to decode auth header: %v", err)
		}
		expected := "key_test:secret_test"
		if string(decoded) != expected {
			t.Errorf("Auth credentials = %q, want %q", string(decoded), expected)
		}

		w.WriteHeader(http.StatusOK)
		fmt.Fprintf(w, `{"id":"order_x","entity":"order","amount":1000,"currency":"INR","status":"created","created_at":0}`)
	}))
	defer server.Close()

	client := NewRazorpayClient("key_test", "secret_test")
	client.BaseURL = server.URL
	client.CreateOrder(1000, "receipt")
}

func TestCreateOrder_RequestBody(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		body, _ := io.ReadAll(r.Body)
		var req RazorpayOrderRequest
		if err := json.Unmarshal(body, &req); err != nil {
			t.Fatalf("Failed to parse request body: %v", err)
		}
		if req.Amount != 75000 {
			t.Errorf("Amount = %d, want 75000", req.Amount)
		}
		if req.Currency != "INR" {
			t.Errorf("Currency = %q, want INR", req.Currency)
		}
		if req.Receipt != "receipt_XYZ" {
			t.Errorf("Receipt = %q, want receipt_XYZ", req.Receipt)
		}
		if r.Header.Get("Content-Type") != "application/json" {
			t.Errorf("Content-Type = %q, want application/json", r.Header.Get("Content-Type"))
		}

		w.WriteHeader(http.StatusOK)
		fmt.Fprintf(w, `{"id":"order_y","entity":"order","amount":75000,"currency":"INR","status":"created","created_at":0}`)
	}))
	defer server.Close()

	client := NewRazorpayClient("key", "secret")
	client.BaseURL = server.URL
	client.CreateOrder(75000, "receipt_XYZ")
}

func TestCreateOrder_APIError(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusBadRequest)
		fmt.Fprintf(w, `{"error":{"description":"Invalid amount"}}`)
	}))
	defer server.Close()

	client := NewRazorpayClient("key", "secret")
	client.BaseURL = server.URL

	_, err := client.CreateOrder(0, "receipt")
	if err == nil {
		t.Fatal("CreateOrder() should return error on API error")
	}
	if !strings.Contains(err.Error(), "razorpay API error") {
		t.Errorf("error = %q, want to contain 'razorpay API error'", err.Error())
	}
}

func TestCreateOrder_ServerDown(t *testing.T) {
	client := NewRazorpayClient("key", "secret")
	client.BaseURL = "http://localhost:1" // nothing listening

	_, err := client.CreateOrder(1000, "receipt")
	if err == nil {
		t.Fatal("CreateOrder() should return error when server is down")
	}
}

func TestCreateOrder_InvalidJSON(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		fmt.Fprintf(w, `not json at all`)
	}))
	defer server.Close()

	client := NewRazorpayClient("key", "secret")
	client.BaseURL = server.URL

	_, err := client.CreateOrder(1000, "receipt")
	if err == nil {
		t.Fatal("CreateOrder() should return error on invalid JSON response")
	}
	if !strings.Contains(err.Error(), "unmarshal") {
		t.Errorf("error = %q, want to contain 'unmarshal'", err.Error())
	}
}

func TestNewRazorpayClient(t *testing.T) {
	client := NewRazorpayClient("my_key", "my_secret")
	if client.KeyID != "my_key" {
		t.Errorf("KeyID = %q, want my_key", client.KeyID)
	}
	if client.KeySecret != "my_secret" {
		t.Errorf("KeySecret = %q, want my_secret", client.KeySecret)
	}
	if client.BaseURL != "https://api.razorpay.com/v1" {
		t.Errorf("BaseURL = %q, want https://api.razorpay.com/v1", client.BaseURL)
	}
}
