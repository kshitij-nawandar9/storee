package services

import (
	"net/http"
	"testing"
	"time"

	"storee/backend/models"

	"gorm.io/gorm"
)

func workerWith(t *testing.T, db *gorm.DB, handler http.HandlerFunc) *NotificationWorker {
	t.Helper()
	notifier := testNotifier()
	notifier.WhatsApp = newTestWhatsApp(t, handler)
	w := NewNotificationWorker(db, notifier)
	w.Interval = time.Millisecond
	return w
}

func queueOne(t *testing.T, db *gorm.DB) models.Notification {
	t.Helper()
	testNotifier().Enqueue(db, testOrder(), EventOrderPlaced)
	var row models.Notification
	if err := db.First(&row).Error; err != nil {
		t.Fatalf("failed to read queued notification: %v", err)
	}
	return row
}

func TestProcessBatchSendsAndMarksSent(t *testing.T) {
	db := setupNotifierDB(t)
	queued := queueOne(t, db)

	calls := 0
	w := workerWith(t, db, func(rw http.ResponseWriter, r *http.Request) {
		calls++
		rw.Write([]byte(`{"messages":[{"id":"wamid.SENT"}]}`))
	})

	sent, failed := w.ProcessBatch()
	if sent != 1 || failed != 0 {
		t.Fatalf("ProcessBatch = (%d sent, %d failed), want (1, 0)", sent, failed)
	}
	if calls != 1 {
		t.Errorf("called the API %d times, want 1", calls)
	}

	var row models.Notification
	db.First(&row, "id = ?", queued.ID)
	if row.Status != models.NotificationSent {
		t.Errorf("status = %q, want sent", row.Status)
	}
	if row.ProviderMessageID != "wamid.SENT" {
		t.Errorf("provider message id = %q", row.ProviderMessageID)
	}
	if row.Attempts != 1 {
		t.Errorf("attempts = %d, want 1", row.Attempts)
	}
	if row.SentAt == nil {
		t.Error("sent_at was not set")
	}
}

// A sent row must never be picked up again — that would double-message.
func TestProcessBatchSkipsAlreadySentRows(t *testing.T) {
	db := setupNotifierDB(t)
	queueOne(t, db)

	calls := 0
	w := workerWith(t, db, func(rw http.ResponseWriter, r *http.Request) {
		calls++
		rw.Write([]byte(`{"messages":[{"id":"wamid.SENT"}]}`))
	})

	w.ProcessBatch()
	w.ProcessBatch()

	if calls != 1 {
		t.Errorf("called the API %d times across two batches, want 1", calls)
	}
}

func TestProcessBatchReschedulesRetryableFailure(t *testing.T) {
	db := setupNotifierDB(t)
	queued := queueOne(t, db)

	w := workerWith(t, db, func(rw http.ResponseWriter, r *http.Request) {
		rw.WriteHeader(http.StatusInternalServerError)
		rw.Write([]byte(`{"error":{"message":"boom","code":500}}`))
	})

	sent, failed := w.ProcessBatch()
	if sent != 0 || failed != 1 {
		t.Fatalf("ProcessBatch = (%d sent, %d failed), want (0, 1)", sent, failed)
	}

	var row models.Notification
	db.First(&row, "id = ?", queued.ID)
	if row.Status != models.NotificationQueued {
		t.Errorf("status = %q, want queued for retry", row.Status)
	}
	if row.Attempts != 1 {
		t.Errorf("attempts = %d, want 1", row.Attempts)
	}
	if row.LastError == "" {
		t.Error("last_error was not recorded")
	}
	if !row.NextRunAt.After(time.Now()) {
		t.Errorf("next_run_at = %v, want a future retry time", row.NextRunAt)
	}
}

// A rejected template will be rejected identically five times; fail it once.
func TestProcessBatchFailsPermanentErrorImmediately(t *testing.T) {
	db := setupNotifierDB(t)
	queued := queueOne(t, db)

	w := workerWith(t, db, func(rw http.ResponseWriter, r *http.Request) {
		rw.WriteHeader(http.StatusBadRequest)
		rw.Write([]byte(`{"error":{"message":"Template name does not exist","code":132001}}`))
	})

	w.ProcessBatch()

	var row models.Notification
	db.First(&row, "id = ?", queued.ID)
	if row.Status != models.NotificationFailed {
		t.Errorf("status = %q, want failed", row.Status)
	}
	if row.Attempts != 1 {
		t.Errorf("attempts = %d, want 1", row.Attempts)
	}
}

func TestProcessBatchGivesUpAtMaxAttempts(t *testing.T) {
	db := setupNotifierDB(t)
	queued := queueOne(t, db)
	db.Model(&models.Notification{}).Where("id = ?", queued.ID).Update("attempts", defaultMaxAttempts-1)

	w := workerWith(t, db, func(rw http.ResponseWriter, r *http.Request) {
		rw.WriteHeader(http.StatusInternalServerError)
	})

	w.ProcessBatch()

	var row models.Notification
	db.First(&row, "id = ?", queued.ID)
	if row.Status != models.NotificationFailed {
		t.Errorf("status = %q, want failed after the last attempt", row.Status)
	}
}

func TestProcessBatchLeavesFutureRetriesAlone(t *testing.T) {
	db := setupNotifierDB(t)
	queued := queueOne(t, db)
	db.Model(&models.Notification{}).Where("id = ?", queued.ID).
		Update("next_run_at", time.Now().Add(time.Hour))

	calls := 0
	w := workerWith(t, db, func(rw http.ResponseWriter, r *http.Request) { calls++ })

	if sent, failed := w.ProcessBatch(); sent != 0 || failed != 0 {
		t.Errorf("ProcessBatch = (%d, %d), want (0, 0)", sent, failed)
	}
	if calls != 0 {
		t.Errorf("called the API %d times for a not-yet-due row, want 0", calls)
	}
}

// A row abandoned by a crashed process must come back, not sit in `sending`.
func TestProcessBatchRequeuesStaleSends(t *testing.T) {
	db := setupNotifierDB(t)
	queued := queueOne(t, db)
	db.Model(&models.Notification{}).Where("id = ?", queued.ID).
		Updates(map[string]any{
			"status":     models.NotificationSending,
			"updated_at": time.Now().Add(-staleSendingAfter - time.Minute),
		})

	w := workerWith(t, db, func(rw http.ResponseWriter, r *http.Request) {
		rw.Write([]byte(`{"messages":[{"id":"wamid.RECOVERED"}]}`))
	})

	if sent, _ := w.ProcessBatch(); sent != 1 {
		t.Fatalf("sent = %d, want 1 after recovering a stale row", sent)
	}

	var row models.Notification
	db.First(&row, "id = ?", queued.ID)
	if row.Status != models.NotificationSent {
		t.Errorf("status = %q, want sent", row.Status)
	}
}

// A send that is merely slow, not dead, must not be picked up twice.
func TestProcessBatchLeavesFreshSendsClaimed(t *testing.T) {
	db := setupNotifierDB(t)
	queued := queueOne(t, db)
	db.Model(&models.Notification{}).Where("id = ?", queued.ID).
		Update("status", models.NotificationSending)

	calls := 0
	w := workerWith(t, db, func(rw http.ResponseWriter, r *http.Request) { calls++ })

	w.ProcessBatch()
	if calls != 0 {
		t.Errorf("called the API %d times for an in-flight send, want 0", calls)
	}

	var row models.Notification
	db.First(&row, "id = ?", queued.ID)
	if row.Status != models.NotificationSending {
		t.Errorf("status = %q, want sending", row.Status)
	}
}

func TestBackoffFor(t *testing.T) {
	if got := backoffFor(1); got != retryBackoff[0] {
		t.Errorf("backoffFor(1) = %v, want %v", got, retryBackoff[0])
	}
	if got := backoffFor(0); got != retryBackoff[0] {
		t.Errorf("backoffFor(0) = %v, want %v", got, retryBackoff[0])
	}
	last := retryBackoff[len(retryBackoff)-1]
	if got := backoffFor(len(retryBackoff) + 10); got != last {
		t.Errorf("backoffFor(overflow) = %v, want %v", got, last)
	}
}
