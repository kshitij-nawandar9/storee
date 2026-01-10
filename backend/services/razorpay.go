package services

import (
	"bytes"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"
)

type RazorpayClient struct {
	KeyID     string
	KeySecret string
	BaseURL   string
}

type RazorpayOrderRequest struct {
	Amount   int64  `json:"amount"`   // in paise
	Currency string `json:"currency"`
	Receipt  string `json:"receipt,omitempty"`
}

type RazorpayOrderResponse struct {
	ID        string `json:"id"`
	Entity    string `json:"entity"`
	Amount    int64  `json:"amount"`
	Currency  string `json:"currency"`
	Receipt   string `json:"receipt"`
	Status    string `json:"status"`
	CreatedAt int64  `json:"created_at"`
}

func NewRazorpayClient(keyID, keySecret string) *RazorpayClient {
	return &RazorpayClient{
		KeyID:     keyID,
		KeySecret: keySecret,
		BaseURL:   "https://api.razorpay.com/v1",
	}
}

func (r *RazorpayClient) CreateOrder(amount int64, receipt string) (*RazorpayOrderResponse, error) {
	reqBody := RazorpayOrderRequest{
		Amount:   amount,
		Currency: "INR",
		Receipt:  receipt,
	}

	jsonData, err := json.Marshal(reqBody)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal request: %w", err)
	}

	req, err := http.NewRequest("POST", r.BaseURL+"/orders", bytes.NewBuffer(jsonData))
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	// Set headers
	auth := base64.StdEncoding.EncodeToString([]byte(r.KeyID + ":" + r.KeySecret))
	req.Header.Set("Authorization", "Basic "+auth)
	req.Header.Set("Content-Type", "application/json")

	// Make request
	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to make request: %w", err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read response: %w", err)
	}

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("razorpay API error: %s (status: %d)", string(body), resp.StatusCode)
	}

	var orderResp RazorpayOrderResponse
	if err := json.Unmarshal(body, &orderResp); err != nil {
		return nil, fmt.Errorf("failed to unmarshal response: %w", err)
	}

	return &orderResp, nil
}
