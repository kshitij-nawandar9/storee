package services

import (
	"encoding/json"
	"errors"
	"io"
	"net/http"
	"net/http/httptest"
	"testing"
)

func newTestWhatsApp(t *testing.T, handler http.HandlerFunc) *WhatsAppClient {
	t.Helper()
	server := httptest.NewServer(handler)
	t.Cleanup(server.Close)

	client := NewWhatsAppClient("PHONE123", "TOKEN456", "v21.0")
	client.BaseURL = server.URL
	return client
}

func TestSendTemplateBuildsCloudAPIRequest(t *testing.T) {
	var gotPath, gotAuth string
	var gotBody map[string]any

	client := newTestWhatsApp(t, func(w http.ResponseWriter, r *http.Request) {
		gotPath = r.URL.Path
		gotAuth = r.Header.Get("Authorization")
		raw, _ := io.ReadAll(r.Body)
		_ = json.Unmarshal(raw, &gotBody)
		w.Write([]byte(`{"messages":[{"id":"wamid.ABC"}]}`))
	})

	id, err := client.SendTemplate("919876543210", "order_placed", "en", []string{"Kshitij", "AB12CD34EF", "1,299"})
	if err != nil {
		t.Fatalf("SendTemplate returned error: %v", err)
	}
	if id != "wamid.ABC" {
		t.Errorf("message id = %q, want wamid.ABC", id)
	}
	if gotPath != "/v21.0/PHONE123/messages" {
		t.Errorf("path = %q", gotPath)
	}
	if gotAuth != "Bearer TOKEN456" {
		t.Errorf("authorization = %q", gotAuth)
	}
	if gotBody["messaging_product"] != "whatsapp" || gotBody["to"] != "919876543210" || gotBody["type"] != "template" {
		t.Errorf("body envelope = %v", gotBody)
	}

	template := gotBody["template"].(map[string]any)
	if template["name"] != "order_placed" {
		t.Errorf("template name = %v", template["name"])
	}
	if lang := template["language"].(map[string]any); lang["code"] != "en" {
		t.Errorf("language = %v", lang)
	}
	components := template["components"].([]any)
	body := components[0].(map[string]any)
	params := body["parameters"].([]any)
	if body["type"] != "body" || len(params) != 3 {
		t.Fatalf("components = %v", components)
	}
	if first := params[0].(map[string]any); first["type"] != "text" || first["text"] != "Kshitij" {
		t.Errorf("first parameter = %v", first)
	}
}

func TestSendTemplateClassifiesErrors(t *testing.T) {
	tests := []struct {
		name          string
		status        int
		body          string
		wantRetryable bool
	}{
		{"unapproved template is permanent", http.StatusBadRequest,
			`{"error":{"message":"Template name does not exist","code":132001}}`, false},
		{"invalid recipient is permanent", http.StatusBadRequest,
			`{"error":{"message":"Invalid parameter","code":100}}`, false},
		{"rate limit is retryable", http.StatusBadRequest,
			`{"error":{"message":"Rate limit hit","code":80007}}`, true},
		{"throughput limit is retryable", http.StatusTooManyRequests,
			`{"error":{"message":"Too many requests","code":130429}}`, true},
		{"server error is retryable", http.StatusInternalServerError, `{}`, true},
		{"unparseable 5xx is retryable", http.StatusBadGateway, `<html>gateway</html>`, true},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			client := newTestWhatsApp(t, func(w http.ResponseWriter, r *http.Request) {
				w.WriteHeader(tt.status)
				w.Write([]byte(tt.body))
			})

			_, err := client.SendTemplate("919876543210", "order_placed", "en", []string{"x"})
			if err == nil {
				t.Fatal("SendTemplate returned no error")
			}
			var apiErr *WhatsAppError
			if !errors.As(err, &apiErr) {
				t.Fatalf("error is %T, want *WhatsAppError", err)
			}
			if apiErr.Retryable != tt.wantRetryable {
				t.Errorf("Retryable = %v, want %v (%v)", apiErr.Retryable, tt.wantRetryable, apiErr)
			}
		})
	}
}

// A 200 with no message id means nothing was actually sent; treating it as
// success would mark the outbox row delivered.
func TestSendTemplateRejectsResponseWithoutMessageID(t *testing.T) {
	client := newTestWhatsApp(t, func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte(`{"messages":[]}`))
	})

	if _, err := client.SendTemplate("919876543210", "order_placed", "en", nil); err == nil {
		t.Fatal("SendTemplate returned no error for a response with no message id")
	}
}

func TestWhatsAppConfigured(t *testing.T) {
	var nilClient *WhatsAppClient
	if nilClient.Configured() {
		t.Error("nil client reported configured")
	}
	if NewWhatsAppClient("", "token", "").Configured() {
		t.Error("client without phone number id reported configured")
	}
	if !NewWhatsAppClient("id", "token", "").Configured() {
		t.Error("fully credentialed client reported unconfigured")
	}
	if got := NewWhatsAppClient("id", "token", "").APIVersion; got != defaultWhatsAppAPIVersion {
		t.Errorf("APIVersion = %q, want the default %q", got, defaultWhatsAppAPIVersion)
	}
}
