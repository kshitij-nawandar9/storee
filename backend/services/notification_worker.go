package services

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"time"

	"storee/backend/models"

	"gorm.io/gorm"
)

// nowFunc is time.Now, indirected so tests can control retry scheduling.
var nowFunc = time.Now

const (
	defaultWorkerInterval  = 15 * time.Second
	defaultWorkerBatchSize = 20
	defaultMaxAttempts     = 5

	// staleSendingAfter is how long a row may sit in `sending` before we assume
	// the process that claimed it died and put it back in the queue. Well above
	// the client's 15s HTTP timeout, so it can't race a slow-but-live send.
	staleSendingAfter = 15 * time.Minute
)

// retryBackoff is the delay before attempt N+1, indexed by attempts already
// made. Deliberately long tails: WhatsApp rate limits and Meta incidents
// resolve in minutes to hours, not seconds.
var retryBackoff = []time.Duration{
	1 * time.Minute,
	5 * time.Minute,
	15 * time.Minute,
	60 * time.Minute,
	180 * time.Minute,
}

// NotificationWorker drains the notification outbox.
type NotificationWorker struct {
	DB          *gorm.DB
	Notifier    *Notifier
	Interval    time.Duration
	BatchSize   int
	MaxAttempts int
}

func NewNotificationWorker(db *gorm.DB, notifier *Notifier) *NotificationWorker {
	return &NotificationWorker{
		DB:          db,
		Notifier:    notifier,
		Interval:    defaultWorkerInterval,
		BatchSize:   defaultWorkerBatchSize,
		MaxAttempts: defaultMaxAttempts,
	}
}

// Start runs the worker until ctx is cancelled. It is a no-op when
// notifications are disabled or unconfigured, so a deploy without WhatsApp
// credentials simply queues nothing and drains nothing.
func (w *NotificationWorker) Start(ctx context.Context) {
	if !w.Notifier.Active() {
		log.Println("Notification worker: WhatsApp not configured, worker not started")
		return
	}

	log.Printf("Notification worker started (interval %s, batch %d)", w.Interval, w.BatchSize)
	ticker := time.NewTicker(w.Interval)
	defer ticker.Stop()

	for {
		select {
		case <-ctx.Done():
			log.Println("Notification worker stopped")
			return
		case <-ticker.C:
			if sent, failed := w.ProcessBatch(); sent > 0 || failed > 0 {
				log.Printf("Notification worker: %d sent, %d failed", sent, failed)
			}
		}
	}
}

// ProcessBatch claims and delivers one batch of due notifications, returning
// how many were sent and how many errored.
func (w *NotificationWorker) ProcessBatch() (sent int, failed int) {
	w.requeueStale()

	var due []models.Notification
	err := w.DB.
		Where("status = ? AND next_run_at <= ?", models.NotificationQueued, nowFunc()).
		Order("next_run_at asc").
		Limit(w.BatchSize).
		Find(&due).Error
	if err != nil {
		log.Printf("Notification worker: failed to read outbox: %v", err)
		return 0, 0
	}

	for i := range due {
		notification := &due[i]
		if !w.claim(notification) {
			continue
		}
		if err := w.deliver(notification); err != nil {
			w.recordFailure(notification, err)
			failed++
			continue
		}
		sent++
	}
	return sent, failed
}

// requeueStale recovers rows whose claiming process died mid-send. Re-sending
// an order update is a far better failure than never sending it.
func (w *NotificationWorker) requeueStale() {
	res := w.DB.Model(&models.Notification{}).
		Where("status = ? AND updated_at < ?", models.NotificationSending, nowFunc().Add(-staleSendingAfter)).
		Updates(map[string]any{"status": models.NotificationQueued, "next_run_at": nowFunc()})
	if res.Error != nil {
		log.Printf("Notification worker: failed to requeue stale sends: %v", res.Error)
		return
	}
	if res.RowsAffected > 0 {
		log.Printf("Notification worker: requeued %d notification(s) stuck in sending", res.RowsAffected)
	}
}

// claim moves a row from queued to sending with a compare-and-swap, so two
// instances of the API never send the same message twice.
func (w *NotificationWorker) claim(n *models.Notification) bool {
	res := w.DB.Model(&models.Notification{}).
		Where("id = ? AND status = ?", n.ID, models.NotificationQueued).
		Updates(map[string]any{"status": models.NotificationSending})
	if res.Error != nil {
		log.Printf("Notification worker: failed to claim %s: %v", n.ID, res.Error)
		return false
	}
	return res.RowsAffected == 1
}

func (w *NotificationWorker) deliver(n *models.Notification) error {
	// One channel today. An email row would never send over WhatsApp, so refuse
	// it outright rather than deliver it down the wrong pipe.
	if n.Channel != ChannelWhatsApp {
		return &WhatsAppError{Message: fmt.Sprintf("unsupported channel %q", n.Channel)}
	}

	var payload MessagePayload
	if err := json.Unmarshal(n.Payload, &payload); err != nil {
		return fmt.Errorf("unreadable payload: %w", err)
	}

	messageID, err := w.Notifier.WhatsApp.SendTemplate(n.Recipient, payload.Template, payload.Language, payload.Params)
	if err != nil {
		return err
	}

	sentAt := nowFunc()
	return w.DB.Model(n).Updates(map[string]any{
		"status":              models.NotificationSent,
		"attempts":            n.Attempts + 1,
		"provider_message_id": messageID,
		"last_error":          "",
		"sent_at":             sentAt,
	}).Error
}

// recordFailure reschedules a retryable failure and gives up on anything else,
// so a rejected template doesn't retry five times before going quiet.
func (w *NotificationWorker) recordFailure(n *models.Notification, cause error) {
	attempts := n.Attempts + 1

	retryable := true
	var apiErr *WhatsAppError
	if errors.As(cause, &apiErr) {
		retryable = apiErr.Retryable
	}

	updates := map[string]any{
		"attempts":   attempts,
		"last_error": cause.Error(),
	}

	if !retryable || attempts >= w.MaxAttempts {
		updates["status"] = models.NotificationFailed
		log.Printf("Notification worker: giving up on %s (%s to %s) after %d attempt(s): %v",
			n.ID, n.Event, n.Recipient, attempts, cause)
	} else {
		updates["status"] = models.NotificationQueued
		updates["next_run_at"] = nowFunc().Add(backoffFor(attempts))
		log.Printf("Notification worker: attempt %d for %s (%s to %s) failed, retrying in %s: %v",
			attempts, n.ID, n.Event, n.Recipient, backoffFor(attempts), cause)
	}

	if err := w.DB.Model(n).Updates(updates).Error; err != nil {
		log.Printf("Notification worker: failed to record failure for %s: %v", n.ID, err)
	}
}

func backoffFor(attempts int) time.Duration {
	if attempts < 1 {
		attempts = 1
	}
	if attempts > len(retryBackoff) {
		return retryBackoff[len(retryBackoff)-1]
	}
	return retryBackoff[attempts-1]
}
