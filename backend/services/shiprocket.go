package services

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"sync"
	"time"
)

// ShiprocketClient talks to the Shiprocket external API
// (https://apidocs.shiprocket.in). Auth tokens are valid for 10 days;
// the client caches one and refreshes it before expiry or on a 401.
type ShiprocketClient struct {
	Email    string
	Password string
	BaseURL  string

	httpClient *http.Client

	mu          sync.Mutex
	token       string
	tokenExpiry time.Time
}

func NewShiprocketClient(email, password string) *ShiprocketClient {
	return &ShiprocketClient{
		Email:      email,
		Password:   password,
		BaseURL:    "https://apiv2.shiprocket.in/v1/external",
		httpClient: &http.Client{Timeout: 15 * time.Second},
	}
}

// Configured reports whether API credentials are present.
func (s *ShiprocketClient) Configured() bool {
	return s.Email != "" && s.Password != ""
}

type ShiprocketOrderItem struct {
	Name         string  `json:"name"`
	SKU          string  `json:"sku"`
	Units        int     `json:"units"`
	SellingPrice float64 `json:"selling_price"` // in rupees
}

type ShiprocketOrderRequest struct {
	OrderID             string                `json:"order_id"`
	OrderDate           string                `json:"order_date"` // "2006-01-02 15:04"
	PickupLocation      string                `json:"pickup_location"`
	BillingCustomerName string                `json:"billing_customer_name"`
	BillingLastName     string                `json:"billing_last_name"`
	BillingAddress      string                `json:"billing_address"`
	BillingAddress2     string                `json:"billing_address_2,omitempty"`
	BillingCity         string                `json:"billing_city"`
	BillingPincode      string                `json:"billing_pincode"`
	BillingState        string                `json:"billing_state"`
	BillingCountry      string                `json:"billing_country"`
	BillingEmail        string                `json:"billing_email"`
	BillingPhone        string                `json:"billing_phone"`
	ShippingIsBilling   bool                  `json:"shipping_is_billing"`
	OrderItems          []ShiprocketOrderItem `json:"order_items"`
	PaymentMethod       string                `json:"payment_method"` // "COD" or "Prepaid"
	SubTotal            float64               `json:"sub_total"`      // in rupees
	Length              float64               `json:"length"`         // cm
	Breadth             float64               `json:"breadth"`        // cm
	Height              float64               `json:"height"`         // cm
	Weight              float64               `json:"weight"`         // kg
}

type ShiprocketOrderResponse struct {
	OrderID     json.Number `json:"order_id"`
	ShipmentID  json.Number `json:"shipment_id"`
	Status      string      `json:"status"`
	AWBCode     string      `json:"awb_code"`
	CourierName string      `json:"courier_name"`
}

type ShiprocketTrackingResponse struct {
	TrackingData struct {
		TrackStatus   int `json:"track_status"`
		ShipmentTrack []struct {
			AWBCode       string `json:"awb_code"`
			CourierName   string `json:"courier_name"`
			CurrentStatus string `json:"current_status"`
			Destination   string `json:"destination"`
			EDD           string `json:"edd"`
		} `json:"shipment_track"`
		ShipmentTrackActivities []struct {
			Date     string `json:"date"`
			Status   string `json:"status"`
			Activity string `json:"activity"`
			Location string `json:"location"`
		} `json:"shipment_track_activities"`
		TrackURL string `json:"track_url"`
	} `json:"tracking_data"`
}

// CreateOrder creates an adhoc order (order + shipment) in Shiprocket.
func (s *ShiprocketClient) CreateOrder(req *ShiprocketOrderRequest) (*ShiprocketOrderResponse, error) {
	respBody, err := s.doRequest("POST", "/orders/create/adhoc", req)
	if err != nil {
		return nil, err
	}
	var resp ShiprocketOrderResponse
	if err := json.Unmarshal(respBody, &resp); err != nil {
		return nil, fmt.Errorf("failed to unmarshal shiprocket response: %w (body: %s)", err, string(respBody))
	}
	if resp.OrderID.String() == "" {
		return nil, fmt.Errorf("shiprocket did not return an order id, response: %s", string(respBody))
	}
	return &resp, nil
}

// TrackShipment fetches tracking details for a Shiprocket shipment ID.
func (s *ShiprocketClient) TrackShipment(shipmentID string) (*ShiprocketTrackingResponse, error) {
	respBody, err := s.doRequest("GET", "/courier/track/shipment/"+shipmentID, nil)
	if err != nil {
		return nil, err
	}
	var resp ShiprocketTrackingResponse
	if err := json.Unmarshal(respBody, &resp); err != nil {
		return nil, fmt.Errorf("failed to unmarshal shiprocket response: %w (body: %s)", err, string(respBody))
	}
	return &resp, nil
}

// doRequest performs an authenticated request and returns the raw response
// body of a 2xx response.
func (s *ShiprocketClient) doRequest(method, path string, body any) ([]byte, error) {
	token, err := s.getToken(false)
	if err != nil {
		return nil, err
	}

	status, respBody, err := s.send(method, path, body, token)
	if err != nil {
		return nil, err
	}
	// Token may have been revoked before its expiry; refresh once and retry.
	if status == http.StatusUnauthorized {
		token, err = s.getToken(true)
		if err != nil {
			return nil, err
		}
		status, respBody, err = s.send(method, path, body, token)
		if err != nil {
			return nil, err
		}
	}

	if status < 200 || status >= 300 {
		return nil, fmt.Errorf("shiprocket API error: %s (status: %d)", string(respBody), status)
	}
	return respBody, nil
}

func (s *ShiprocketClient) send(method, path string, body any, token string) (int, []byte, error) {
	var reader io.Reader
	if body != nil {
		jsonData, err := json.Marshal(body)
		if err != nil {
			return 0, nil, fmt.Errorf("failed to marshal request: %w", err)
		}
		reader = bytes.NewReader(jsonData)
	}

	req, err := http.NewRequest(method, s.BaseURL+path, reader)
	if err != nil {
		return 0, nil, fmt.Errorf("failed to create request: %w", err)
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+token)

	resp, err := s.httpClient.Do(req)
	if err != nil {
		return 0, nil, fmt.Errorf("failed to make request: %w", err)
	}
	defer resp.Body.Close()

	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		return 0, nil, fmt.Errorf("failed to read response: %w", err)
	}
	return resp.StatusCode, respBody, nil
}

// getToken returns a cached auth token, logging in when the cache is empty,
// expired, or force is set.
func (s *ShiprocketClient) getToken(force bool) (string, error) {
	if !s.Configured() {
		return "", fmt.Errorf("shiprocket is not configured: set SHIPROCKET_EMAIL and SHIPROCKET_PASSWORD")
	}

	s.mu.Lock()
	defer s.mu.Unlock()
	if !force && s.token != "" && time.Now().Before(s.tokenExpiry) {
		return s.token, nil
	}

	jsonData, err := json.Marshal(map[string]string{"email": s.Email, "password": s.Password})
	if err != nil {
		return "", fmt.Errorf("failed to marshal login request: %w", err)
	}
	req, err := http.NewRequest("POST", s.BaseURL+"/auth/login", bytes.NewReader(jsonData))
	if err != nil {
		return "", fmt.Errorf("failed to create login request: %w", err)
	}
	req.Header.Set("Content-Type", "application/json")

	resp, err := s.httpClient.Do(req)
	if err != nil {
		return "", fmt.Errorf("shiprocket login failed: %w", err)
	}
	defer resp.Body.Close()

	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", fmt.Errorf("failed to read login response: %w", err)
	}
	if resp.StatusCode != http.StatusOK {
		return "", fmt.Errorf("shiprocket login error: %s (status: %d)", string(respBody), resp.StatusCode)
	}

	var loginResp struct {
		Token string `json:"token"`
	}
	if err := json.Unmarshal(respBody, &loginResp); err != nil {
		return "", fmt.Errorf("failed to unmarshal login response: %w", err)
	}
	if loginResp.Token == "" {
		return "", fmt.Errorf("shiprocket login returned no token")
	}

	// Tokens are valid for 10 days; refresh a day early to be safe.
	s.token = loginResp.Token
	s.tokenExpiry = time.Now().Add(9 * 24 * time.Hour)
	return s.token, nil
}
