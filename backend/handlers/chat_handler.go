package handlers

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strings"

	"storee/backend/models"
	"storee/backend/services"
	"storee/backend/utils"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

const (
	maxChatMessages   = 20   // history the client may send per request
	maxChatMessageLen = 2000 // characters per message
	maxToolRounds     = 5    // tool-use round trips per request
	chatMaxTokens     = 1024
	maxSearchResults  = 5
)

const chatSystemPrompt = `You are the customer support assistant for Storee (thestoree.in), an Indian online gift store selling pouches, keychains, hampers and similar gifting products.

Store facts:
- Prices are in Indian Rupees (₹).
- Shipping: flat ₹99, FREE on orders above ₹1,000. Pan-India delivery.
- Orders are dispatched in 5-7 working days; delivery time depends on location.
- Returns: hassle-free 7-day replacement policy.
- Payments: online payment (cards/UPI/netbanking via Razorpay) or Cash on Delivery.
- Order tracking: once shipped, customers get an AWB tracking number visible on their Orders page.

Rules:
- Use the search_products tool to answer any question about products, prices or availability. Never invent products or prices.
- Use the get_order_status tool for order questions. It requires BOTH the order ID and the email used at checkout — ask for whichever is missing before calling it.
- Never reveal information about an order unless the customer provides the matching email.
- Only help with Storee-related topics (products, orders, shipping, returns, payments). Politely decline anything else.
- Be friendly and concise: a short paragraph or a few bullet points. Plain text only, no markdown headings or tables.
- If you cannot help, suggest emailing thestoree.in@gmail.com.`

var chatTools = []services.ClaudeTool{
	{
		Name:        "search_products",
		Description: "Search the store catalog by keyword. Matches product name, description and category. Returns up to 5 active products with name, category, price in rupees, availability and product page URL.",
		InputSchema: map[string]any{
			"type": "object",
			"properties": map[string]any{
				"query": map[string]any{
					"type":        "string",
					"description": "Keyword(s) to search for, e.g. 'hamper', 'pouch', 'rakhi'. Use an empty string to list the latest products.",
				},
			},
			"required": []string{"query"},
		},
	},
	{
		Name:        "get_order_status",
		Description: "Look up an order's status, items and tracking details. Requires the order ID and the email address used when placing the order; returns nothing if they don't match.",
		InputSchema: map[string]any{
			"type": "object",
			"properties": map[string]any{
				"order_id": map[string]any{
					"type":        "string",
					"description": "The 10-character order ID, e.g. YBOV3E90AO",
				},
				"email": map[string]any{
					"type":        "string",
					"description": "Email address the customer used at checkout",
				},
			},
			"required": []string{"order_id", "email"},
		},
	},
}

type ChatHandler struct {
	DB     *gorm.DB
	Claude *services.ClaudeClient
}

func NewChatHandler(db *gorm.DB, claude *services.ClaudeClient) *ChatHandler {
	return &ChatHandler{DB: db, Claude: claude}
}

type ChatMessage struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

type ChatRequest struct {
	Messages []ChatMessage `json:"messages"`
}

// Chat handles POST /api/v1/chat — runs one assistant turn, executing store
// tools (product search, order lookup) as the model requests them.
func (h *ChatHandler) Chat(c *gin.Context) {
	if !h.Claude.Configured() {
		utils.ErrorResponse(c, http.StatusServiceUnavailable, "Chat is not configured. Set ANTHROPIC_API_KEY.", nil)
		return
	}

	var req ChatRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid request data", err)
		return
	}
	msgs, err := validateChatMessages(req.Messages)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, err.Error(), nil)
		return
	}

	for round := 0; round < maxToolRounds; round++ {
		resp, err := h.Claude.CreateMessage(chatSystemPrompt, msgs, chatTools, chatMaxTokens)
		if err != nil {
			log.Printf("Chat: claude request failed: %v", err)
			utils.ErrorResponse(c, http.StatusBadGateway, "The assistant is unavailable right now, please try again shortly", nil)
			return
		}

		if resp.StopReason != "tool_use" {
			utils.SuccessResponse(c, http.StatusOK, "Reply generated", gin.H{"reply": resp.Text()})
			return
		}

		msgs = append(msgs, services.ClaudeMessage{Role: "assistant", Content: resp.Content})
		var results []services.ClaudeContentBlock
		for _, block := range resp.Content {
			if block.Type != "tool_use" {
				continue
			}
			out, toolErr := h.executeTool(block.Name, block.Input)
			result := services.ClaudeContentBlock{Type: "tool_result", ToolUseID: block.ID, Content: out}
			if toolErr != nil {
				log.Printf("Chat: tool %s failed: %v", block.Name, toolErr)
				result.Content = "The tool failed, apologise and suggest emailing support."
				result.IsError = true
			}
			results = append(results, result)
		}
		msgs = append(msgs, services.ClaudeMessage{Role: "user", Content: results})
	}

	log.Printf("Chat: exceeded %d tool rounds", maxToolRounds)
	utils.ErrorResponse(c, http.StatusBadGateway, "The assistant is unavailable right now, please try again shortly", nil)
}

// validateChatMessages sanity-checks client-supplied history and converts it
// to Claude messages.
func validateChatMessages(in []ChatMessage) ([]services.ClaudeMessage, error) {
	if len(in) == 0 {
		return nil, fmt.Errorf("messages must not be empty")
	}
	if len(in) > maxChatMessages {
		// Keep the most recent history rather than rejecting long conversations.
		in = in[len(in)-maxChatMessages:]
	}
	// A valid Claude conversation must start with a user message.
	for len(in) > 0 && in[0].Role != "user" {
		in = in[1:]
	}
	if len(in) == 0 || in[len(in)-1].Role != "user" {
		return nil, fmt.Errorf("the last message must be from the user")
	}

	msgs := make([]services.ClaudeMessage, 0, len(in))
	for _, m := range in {
		if m.Role != "user" && m.Role != "assistant" {
			return nil, fmt.Errorf("invalid message role %q", m.Role)
		}
		content := strings.TrimSpace(m.Content)
		if content == "" {
			return nil, fmt.Errorf("messages must not be empty")
		}
		if len(content) > maxChatMessageLen {
			return nil, fmt.Errorf("messages must be at most %d characters", maxChatMessageLen)
		}
		msgs = append(msgs, services.TextMessage(m.Role, content))
	}
	return msgs, nil
}

func (h *ChatHandler) executeTool(name string, input json.RawMessage) (string, error) {
	switch name {
	case "search_products":
		var args struct {
			Query string `json:"query"`
		}
		if err := json.Unmarshal(input, &args); err != nil {
			return "", fmt.Errorf("invalid input: %w", err)
		}
		return h.searchProducts(args.Query)
	case "get_order_status":
		var args struct {
			OrderID string `json:"order_id"`
			Email   string `json:"email"`
		}
		if err := json.Unmarshal(input, &args); err != nil {
			return "", fmt.Errorf("invalid input: %w", err)
		}
		return h.getOrderStatus(args.OrderID, args.Email)
	default:
		return "", fmt.Errorf("unknown tool %q", name)
	}
}

type chatProductResult struct {
	Name        string  `json:"name"`
	Category    string  `json:"category"`
	PriceRupees float64 `json:"priceRupees"`
	Description string  `json:"description,omitempty"`
	InStock     bool    `json:"inStock"`
	URL         string  `json:"url"`
}

func (h *ChatHandler) searchProducts(query string) (string, error) {
	q := h.DB.Where("is_active = ?", true).Order("created_at DESC").Limit(maxSearchResults)
	if query = strings.TrimSpace(query); query != "" {
		like := "%" + query + "%"
		q = q.Where("name LIKE ? OR description LIKE ? OR category LIKE ?", like, like, like)
	}
	var products []models.Product
	if err := q.Find(&products).Error; err != nil {
		return "", fmt.Errorf("product search failed: %w", err)
	}
	if len(products) == 0 {
		return "No matching products found.", nil
	}

	results := make([]chatProductResult, 0, len(products))
	for _, p := range products {
		desc := p.Description
		if len(desc) > 200 {
			desc = desc[:200] + "..."
		}
		results = append(results, chatProductResult{
			Name:        p.Name,
			Category:    p.Category,
			PriceRupees: float64(p.BasePrice) / 100,
			Description: desc,
			InStock:     p.Stock == nil || *p.Stock > 0,
			URL:         "/products/" + p.Slug,
		})
	}
	out, err := json.Marshal(results)
	if err != nil {
		return "", err
	}
	return string(out), nil
}

func (h *ChatHandler) getOrderStatus(orderID, email string) (string, error) {
	orderID = strings.ToUpper(strings.TrimSpace(orderID))
	email = strings.TrimSpace(email)
	if orderID == "" || email == "" {
		return "Both order_id and email are required.", nil
	}

	var order models.Order
	err := h.DB.Where("order_id = ?", orderID).First(&order).Error
	if err == gorm.ErrRecordNotFound || (err == nil && !strings.EqualFold(order.CustomerEmail, email)) {
		// Same answer for wrong ID and wrong email so the tool can't be used
		// to probe which order IDs exist.
		return "No order found for that order ID and email combination. Ask the customer to double-check both.", nil
	}
	if err != nil {
		return "", fmt.Errorf("order lookup failed: %w", err)
	}

	var items []orderItem
	_ = json.Unmarshal(order.Items, &items)
	itemNames := make([]string, 0, len(items))
	for i, item := range items {
		name := item.Name
		if name == "" {
			name = item.Product.Name
		}
		if name == "" {
			name = fmt.Sprintf("Item %d", i+1)
		}
		qty := item.Quantity
		if qty < 1 {
			qty = 1
		}
		itemNames = append(itemNames, fmt.Sprintf("%s x%d", name, qty))
	}

	result := map[string]any{
		"orderId":       order.OrderID,
		"status":        order.Status,
		"paymentMethod": order.PaymentMethod,
		"totalRupees":   float64(order.TotalAmount) / 100,
		"placedOn":      order.CreatedAt.Format("2 Jan 2006"),
		"items":         itemNames,
	}
	if order.CourierName != "" {
		result["courier"] = order.CourierName
	}
	if order.AWBCode != "" {
		result["awbCode"] = order.AWBCode
		result["trackingUrl"] = "https://shiprocket.co/tracking/" + order.AWBCode
	}
	out, err := json.Marshal(result)
	if err != nil {
		return "", err
	}
	return string(out), nil
}
