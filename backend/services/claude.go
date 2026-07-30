package services

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"
)

// ClaudeClient talks to the Anthropic Messages API
// (https://docs.anthropic.com/en/api/messages). Used by the store chatbot.
type ClaudeClient struct {
	APIKey  string
	Model   string
	BaseURL string

	httpClient *http.Client
}

func NewClaudeClient(apiKey, model string) *ClaudeClient {
	return &ClaudeClient{
		APIKey:     apiKey,
		Model:      model,
		BaseURL:    "https://api.anthropic.com/v1",
		httpClient: &http.Client{Timeout: 60 * time.Second},
	}
}

// Configured reports whether an API key is present.
func (c *ClaudeClient) Configured() bool {
	return c.APIKey != ""
}

// ClaudeContentBlock is a single content block in a message. Which fields are
// set depends on Type: "text" uses Text; "tool_use" uses ID/Name/Input;
// "tool_result" uses ToolUseID/Content/IsError.
type ClaudeContentBlock struct {
	Type      string          `json:"type"`
	Text      string          `json:"text,omitempty"`
	ID        string          `json:"id,omitempty"`
	Name      string          `json:"name,omitempty"`
	Input     json.RawMessage `json:"input,omitempty"`
	ToolUseID string          `json:"tool_use_id,omitempty"`
	Content   string          `json:"content,omitempty"`
	IsError   bool            `json:"is_error,omitempty"`
}

type ClaudeMessage struct {
	Role    string               `json:"role"` // "user" or "assistant"
	Content []ClaudeContentBlock `json:"content"`
}

// TextMessage builds a plain-text message.
func TextMessage(role, text string) ClaudeMessage {
	return ClaudeMessage{Role: role, Content: []ClaudeContentBlock{{Type: "text", Text: text}}}
}

type ClaudeTool struct {
	Name        string         `json:"name"`
	Description string         `json:"description"`
	InputSchema map[string]any `json:"input_schema"`
}

type claudeRequest struct {
	Model     string          `json:"model"`
	MaxTokens int             `json:"max_tokens"`
	System    string          `json:"system,omitempty"`
	Messages  []ClaudeMessage `json:"messages"`
	Tools     []ClaudeTool    `json:"tools,omitempty"`
}

type ClaudeResponse struct {
	ID         string               `json:"id"`
	StopReason string               `json:"stop_reason"` // "end_turn", "tool_use", "max_tokens", ...
	Content    []ClaudeContentBlock `json:"content"`
}

// Text concatenates all text blocks in the response.
func (r *ClaudeResponse) Text() string {
	var out string
	for _, block := range r.Content {
		if block.Type == "text" {
			out += block.Text
		}
	}
	return out
}

// CreateMessage calls the Messages API once. Tool execution loops are the
// caller's responsibility.
func (c *ClaudeClient) CreateMessage(system string, messages []ClaudeMessage, tools []ClaudeTool, maxTokens int) (*ClaudeResponse, error) {
	if !c.Configured() {
		return nil, fmt.Errorf("claude is not configured: set ANTHROPIC_API_KEY")
	}

	jsonData, err := json.Marshal(claudeRequest{
		Model:     c.Model,
		MaxTokens: maxTokens,
		System:    system,
		Messages:  messages,
		Tools:     tools,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to marshal request: %w", err)
	}

	req, err := http.NewRequest("POST", c.BaseURL+"/messages", bytes.NewReader(jsonData))
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("x-api-key", c.APIKey)
	req.Header.Set("anthropic-version", "2023-06-01")

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to make request: %w", err)
	}
	defer resp.Body.Close()

	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read response: %w", err)
	}
	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return nil, fmt.Errorf("claude API error: %s (status: %d)", string(respBody), resp.StatusCode)
	}

	var claudeResp ClaudeResponse
	if err := json.Unmarshal(respBody, &claudeResp); err != nil {
		return nil, fmt.Errorf("failed to unmarshal claude response: %w (body: %s)", err, string(respBody))
	}
	return &claudeResp, nil
}
