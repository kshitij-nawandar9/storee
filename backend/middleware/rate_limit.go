package middleware

import (
	"net/http"
	"sync"
	"time"

	"storee/backend/utils"

	"github.com/gin-gonic/gin"
)

// RateLimitMiddleware allows at most maxRequests per window per client IP,
// using an in-memory sliding window. Good enough for a single-instance
// deployment; state is lost on restart.
func RateLimitMiddleware(maxRequests int, window time.Duration) gin.HandlerFunc {
	var (
		mu       sync.Mutex
		requests = make(map[string][]time.Time)
	)

	return func(c *gin.Context) {
		ip := c.ClientIP()
		now := time.Now()
		cutoff := now.Add(-window)

		mu.Lock()
		// Drop expired timestamps; delete idle IPs so the map doesn't grow forever.
		kept := requests[ip][:0]
		for _, t := range requests[ip] {
			if t.After(cutoff) {
				kept = append(kept, t)
			}
		}
		if len(kept) >= maxRequests {
			requests[ip] = kept
			mu.Unlock()
			utils.ErrorResponse(c, http.StatusTooManyRequests, "Too many requests, please try again in a few minutes", nil)
			c.Abort()
			return
		}
		requests[ip] = append(kept, now)
		for other, ts := range requests {
			if other != ip && (len(ts) == 0 || !ts[len(ts)-1].After(cutoff)) {
				delete(requests, other)
			}
		}
		mu.Unlock()

		c.Next()
	}
}
