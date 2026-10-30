package services

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"
)

const defaultWhatsAppAPIVersion = "v21.0"

// WhatsAppClient talks to the Meta WhatsApp Cloud API
// (https://developers.facebook.com/docs/whatsapp/cloud-api). Business-initiated
// messages must use templates pre-approved in the WhatsApp Manager; see
// docs/WHATSAPP_NOTIFICATIONS.md for the exact bodies to submit.
type WhatsAppClient struct {
	PhoneNumberID string
	AccessToken   string
	BaseURL       string
	APIVersion    string

	httpClient *http.Client
}

func NewWhatsAppClient(phoneNumberID, accessToken, apiVersion string) *WhatsAppClient {
	if apiVersion == "" {
		apiVersion = defaultWhatsAppAPIVersion
	}
	return &WhatsAppClient{
		PhoneNumberID: phoneNumberID,
		AccessToken:   accessToken,
		BaseURL:       "https://graph.facebook.com",
		APIVersion:    apiVersion,
		httpClient:    &http.Client{Timeout: 15 * time.Second},
	}
}

// Configured reports whether API credentials are present.
func (w *WhatsAppClient) Configured() bool {
	return w != nil && w.PhoneNumberID != "" && w.AccessToken != ""
}

// WhatsAppError carries the Graph API error and, more importantly, whether it
// is worth retrying. A rate limit or a 5xx will succeed later; an unapproved
// template or an invalid recipient never will, and retrying it just burns
// attempts and log noise.
type WhatsAppError struct {
	StatusCode int
	Code       int
	Subcode    int
	Message    string
	Retryable  bool
}

func (e *WhatsAppError) Error() string {
	return fmt.Sprintf("whatsapp api error (http %d, code %d/%d): %s", e.StatusCode, e.Code, e.Subcode, e.Message)
}

// retryableErrorCodes are the Graph API codes that represent transient
// conditions rather than a permanently bad message.
var retryableErrorCodes = map[int]bool{
	4:      true, // application request limit reached
	80007:  true, // rate limit hit
	130429: true, // cloud API message throughput reached
	131048: true, // spam rate limit hit
	131056: true, // pair rate limit hit
	133016: true, // account restore in progress
	1:      true, // unknown/transient API error
	2:      true, // temporary Graph API service issue
}

type whatsAppTemplateParam struct {
	Type string `json:"type"`
	Text string `json:"text"`
}

type whatsAppComponent struct {
	Type       string                  `json:"type"`
	Parameters []whatsAppTemplateParam `json:"parameters"`
}

type whatsAppTemplateMessage struct {
	MessagingProduct string `json:"messaging_product"`
	To               string `json:"to"`
	Type             string `json:"type"`
	Template         struct {
		Name     string `json:"name"`
		Language struct {
			Code string `json:"code"`
		} `json:"language"`
		Components []whatsAppComponent `json:"components,omitempty"`
	} `json:"template"`
}

type whatsAppSendResponse struct {
	Messages []struct {
		ID string `json:"id"`
	} `json:"messages"`
	Error *struct {
		Message   string `json:"message"`
		Type      string `json:"type"`
		Code      int    `json:"code"`
		Subcode   int    `json:"error_subcode"`
		FBTraceID string `json:"fbtrace_id"`
	} `json:"error"`
}

// SendTemplate sends an approved template message and returns the provider's
// message ID (wamid). `to` must be digits-only E.164 (see
// utils.NormalizeIndianPhone); params fill the template's {{1}}, {{2}}, ... in
// order.
func (w *WhatsAppClient) SendTemplate(to, templateName, languageCode string, params []string) (string, error) {
	if !w.Configured() {
		return "", fmt.Errorf("whatsapp client is not configured")
	}

	var msg whatsAppTemplateMessage
	msg.MessagingProduct = "whatsapp"
	msg.To = to
	msg.Type = "template"
	msg.Template.Name = templateName
	msg.Template.Language.Code = languageCode
	if len(params) > 0 {
		body := whatsAppComponent{Type: "body"}
		for _, p := range params {
			body.Parameters = append(body.Parameters, whatsAppTemplateParam{Type: "text", Text: p})
		}
		msg.Template.Components = []whatsAppComponent{body}
	}

	payload, err := json.Marshal(msg)
	if err != nil {
		return "", fmt.Errorf("failed to marshal whatsapp message: %w", err)
	}

	url := fmt.Sprintf("%s/%s/%s/messages", w.BaseURL, w.APIVersion, w.PhoneNumberID)
	req, err := http.NewRequest("POST", url, bytes.NewReader(payload))
	if err != nil {
		return "", fmt.Errorf("failed to build whatsapp request: %w", err)
	}
	req.Header.Set("Authorization", "Bearer "+w.AccessToken)
	req.Header.Set("Content-Type", "application/json")

	resp, err := w.httpClient.Do(req)
	if err != nil {
		// Network-level failures are always worth another go.
		return "", &WhatsAppError{Message: err.Error(), Retryable: true}
	}
	defer resp.Body.Close()

	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", &WhatsAppError{StatusCode: resp.StatusCode, Message: err.Error(), Retryable: true}
	}

	var parsed whatsAppSendResponse
	if jsonErr := json.Unmarshal(respBody, &parsed); jsonErr != nil {
		return "", &WhatsAppError{
			StatusCode: resp.StatusCode,
			Message:    fmt.Sprintf("unparseable response: %s", string(respBody)),
			Retryable:  resp.StatusCode >= 500,
		}
	}

	if resp.StatusCode < 200 || resp.StatusCode >= 300 || parsed.Error != nil {
		apiErr := &WhatsAppError{StatusCode: resp.StatusCode, Message: string(respBody)}
		if parsed.Error != nil {
			apiErr.Code = parsed.Error.Code
			apiErr.Subcode = parsed.Error.Subcode
			apiErr.Message = parsed.Error.Message
		}
		apiErr.Retryable = resp.StatusCode >= 500 || resp.StatusCode == http.StatusTooManyRequests || retryableErrorCodes[apiErr.Code]
		return "", apiErr
	}

	if len(parsed.Messages) == 0 || parsed.Messages[0].ID == "" {
		return "", &WhatsAppError{
			StatusCode: resp.StatusCode,
			Message:    fmt.Sprintf("whatsapp accepted the request but returned no message id, response: %s", string(respBody)),
		}
	}
	return parsed.Messages[0].ID, nil
}
