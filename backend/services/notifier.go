package services

import (
	"log"
	"strings"

	"storee/backend/models"
	"storee/backend/utils"

	"gorm.io/datatypes"
	"gorm.io/gorm"
)

// Order lifecycle events that produce a customer- or admin-facing message.
const (
	EventOrderPlaced     = "order_placed"     // COD order created
	EventPaymentReceived = "payment_received" // Razorpay payment verified
	EventOrderShipped    = "order_shipped"    // Admin moved the order to shipped
	EventOrderDelivered  = "order_delivered"  // Admin moved the order to delivered
	EventOrderCancelled  = "order_cancelled"  // Admin cancelled, or payment failed
)

// Notification channels.
const ChannelWhatsApp = "whatsapp"

// Audiences.
const (
	AudienceCustomer = "customer"
	AudienceAdmin    = "admin"
)

// Names of the templates approved in WhatsApp Manager. These must match the
// approved templates exactly — Meta rejects unknown names with a permanent
// error. docs/WHATSAPP_NOTIFICATIONS.md has the bodies to submit.
const (
	templateOrderPlaced     = "order_placed"
	templatePaymentReceived = "payment_received"
	templateOrderShipped    = "order_shipped"
	templateOrderDelivered  = "order_delivered"
	templateOrderCancelled  = "order_cancelled"
	templateAdminOrderAlert = "admin_order_alert"
)

// adminEventLabels lists the events admins are alerted about, mapped to the
// label that fills {{1}} of admin_order_alert. Fulfilment steps the admin
// performed themselves (shipped, delivered) are deliberately absent — alerting
// someone about their own click is noise.
var adminEventLabels = map[string]string{
	EventOrderPlaced:     "New COD order",
	EventPaymentReceived: "Payment received",
	EventOrderCancelled:  "Order cancelled",
}

// MessagePayload is the rendered message stored on the outbox row.
type MessagePayload struct {
	Template string   `json:"template"`
	Language string   `json:"language"`
	Params   []string `json:"params"`
}

// Notifier renders order events into outbox rows. It never sends anything
// itself; NotificationWorker drains the outbox.
type Notifier struct {
	WhatsApp     *WhatsAppClient
	AdminNumbers []string
	Language     string
	Enabled      bool
}

func NewNotifier(whatsapp *WhatsAppClient, adminNumbers []string, language string, enabled bool) *Notifier {
	if language == "" {
		language = "en"
	}
	return &Notifier{
		WhatsApp:     whatsapp,
		AdminNumbers: normalizeAdminNumbers(adminNumbers),
		Language:     language,
		Enabled:      enabled,
	}
}

func normalizeAdminNumbers(raw []string) []string {
	var out []string
	for _, number := range raw {
		normalized, ok := utils.NormalizeIndianPhone(number)
		if !ok {
			log.Printf("Notifier: ignoring unparseable admin WhatsApp number %q", number)
			continue
		}
		out = append(out, normalized)
	}
	return out
}

// Active reports whether enqueueing will actually produce anything. A nil
// Notifier is inactive, which is what keeps handler tests free of config.
func (n *Notifier) Active() bool {
	return n != nil && n.Enabled && n.WhatsApp.Configured()
}

// Enqueue writes the outbox rows for one order event. It is best-effort by
// design: a failure to queue a message must never fail the request that
// changed the order, so errors are logged and swallowed.
//
// Pass the same *gorm.DB the caller used for the status write so the rows land
// in that transaction when there is one.
func (n *Notifier) Enqueue(db *gorm.DB, order *models.Order, event string) {
	if !n.Active() || order == nil {
		return
	}

	for _, notification := range n.build(order, event) {
		// A duplicate DedupeKey means this event was already queued (the
		// verify-payment / webhook race), so a unique-constraint error here is
		// the mechanism working, not a fault.
		if err := db.Create(&notification).Error; err != nil {
			if isDuplicateKeyError(err) {
				log.Printf("Notifier: %s/%s for order %s already queued, skipping", event, notification.Audience, order.OrderID)
				continue
			}
			log.Printf("Notifier: failed to queue %s/%s for order %s: %v", event, notification.Audience, order.OrderID, err)
			continue
		}
		log.Printf("Notifier: queued %s %s notification for order %s", event, notification.Audience, order.OrderID)
	}
}

// build renders the outbox rows for an event without touching the database.
func (n *Notifier) build(order *models.Order, event string) []models.Notification {
	var out []models.Notification

	if payload, ok := n.customerPayload(order, event); ok {
		if to, valid := utils.NormalizeIndianPhone(order.CustomerPhone); valid {
			out = append(out, n.newNotification(order, event, AudienceCustomer, to, payload))
		} else {
			log.Printf("Notifier: skipping customer WhatsApp for order %s, unusable phone %q", order.OrderID, order.CustomerPhone)
		}
	}

	if payload, ok := n.adminPayload(order, event); ok {
		for _, to := range n.AdminNumbers {
			out = append(out, n.newNotification(order, event, AudienceAdmin, to, payload))
		}
	}

	return out
}

func (n *Notifier) newNotification(order *models.Order, event, audience, recipient string, payload MessagePayload) models.Notification {
	return models.Notification{
		OrderID:   order.OrderID,
		Event:     event,
		Channel:   ChannelWhatsApp,
		Audience:  audience,
		Recipient: recipient,
		DedupeKey: strings.Join([]string{order.OrderID, event, ChannelWhatsApp, recipient}, ":"),
		Payload:   datatypes.JSON(utils.MustMarshalJSON(payload)),
		Status:    models.NotificationQueued,
		NextRunAt: nowFunc(),
	}
}

func (n *Notifier) customerPayload(order *models.Order, event string) (MessagePayload, bool) {
	name := customerFirstName(order.CustomerName)
	amount := utils.FormatINR(order.TotalAmount)

	switch event {
	case EventOrderPlaced:
		return n.payload(templateOrderPlaced, name, order.OrderID, amount), true
	case EventPaymentReceived:
		return n.payload(templatePaymentReceived, name, order.OrderID, amount), true
	case EventOrderShipped:
		courier := fallback(order.CourierName, "our courier partner")
		awb := fallback(order.AWBCode, "will be shared shortly")
		return n.payload(templateOrderShipped, name, order.OrderID, courier, awb), true
	case EventOrderDelivered:
		return n.payload(templateOrderDelivered, name, order.OrderID), true
	case EventOrderCancelled:
		return n.payload(templateOrderCancelled, name, order.OrderID), true
	}
	return MessagePayload{}, false
}

func (n *Notifier) adminPayload(order *models.Order, event string) (MessagePayload, bool) {
	label, ok := adminEventLabels[event]
	if !ok || len(n.AdminNumbers) == 0 {
		return MessagePayload{}, false
	}
	return n.payload(
		templateAdminOrderAlert,
		label,
		order.OrderID,
		fallback(order.CustomerName, "Unknown customer"),
		utils.FormatINR(order.TotalAmount),
	), true
}

func (n *Notifier) payload(template string, params ...string) MessagePayload {
	return MessagePayload{Template: template, Language: n.Language, Params: params}
}

// customerFirstName keeps greetings short. Template parameters cannot be empty
// or contain newlines, so fall back to a generic greeting.
func customerFirstName(fullName string) string {
	name := strings.TrimSpace(strings.ReplaceAll(fullName, "\n", " "))
	if name == "" {
		return "there"
	}
	if first, _, found := strings.Cut(name, " "); found && first != "" {
		return first
	}
	return name
}

func fallback(value, or string) string {
	if trimmed := strings.TrimSpace(value); trimmed != "" {
		return trimmed
	}
	return or
}

func isDuplicateKeyError(err error) bool {
	if err == nil {
		return false
	}
	// gorm.ErrDuplicatedKey needs TranslateError enabled on the dialector, so
	// fall back to matching the MySQL and SQLite messages too.
	if err == gorm.ErrDuplicatedKey {
		return true
	}
	msg := strings.ToLower(err.Error())
	return strings.Contains(msg, "duplicate entry") ||
		strings.Contains(msg, "unique constraint") ||
		strings.Contains(msg, "duplicate key")
}
