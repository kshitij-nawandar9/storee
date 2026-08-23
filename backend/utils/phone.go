package utils

import (
	"fmt"
	"strconv"
	"strings"
)

// NormalizeIndianPhone converts the loosely formatted numbers we collect at
// checkout ("9876543210", "+91 98765 43210", "098765-43210") into the
// digits-only E.164 form the WhatsApp Cloud API expects ("919876543210").
//
// It deliberately only accepts Indian mobile numbers. Anything else — a
// landline, a typo, a foreign number — returns ok=false so we skip the
// WhatsApp send rather than message a stranger.
func NormalizeIndianPhone(raw string) (string, bool) {
	var digits strings.Builder
	for _, r := range raw {
		if r >= '0' && r <= '9' {
			digits.WriteRune(r)
		}
	}
	d := digits.String()

	// Strip trunk prefixes and the country code down to the 10-digit subscriber
	// number, then validate it as a mobile.
	switch {
	case len(d) == 10:
	case len(d) == 11 && strings.HasPrefix(d, "0"):
		d = d[1:]
	case len(d) == 12 && strings.HasPrefix(d, "91"):
		d = d[2:]
	case len(d) == 13 && strings.HasPrefix(d, "091"):
		d = d[3:]
	default:
		return "", false
	}

	// Indian mobile numbers start with 6-9; landlines and garbage do not.
	if d[0] < '6' || d[0] > '9' {
		return "", false
	}
	return "91" + d, true
}

// FormatINR renders an amount in paise as rupees with Indian digit grouping
// (1234567 paise -> "12,345.67"), for use in message bodies.
func FormatINR(paise int64) string {
	negative := paise < 0
	if negative {
		paise = -paise
	}

	rupees := paise / 100
	fraction := paise % 100

	// Indian grouping: last three digits, then pairs (12,34,567).
	s := strconv.FormatInt(rupees, 10)
	var grouped string
	if len(s) <= 3 {
		grouped = s
	} else {
		head, tail := s[:len(s)-3], s[len(s)-3:]
		var parts []string
		for len(head) > 2 {
			parts = append([]string{head[len(head)-2:]}, parts...)
			head = head[:len(head)-2]
		}
		if head != "" {
			parts = append([]string{head}, parts...)
		}
		grouped = strings.Join(parts, ",") + "," + tail
	}

	out := grouped
	if fraction != 0 {
		out += fmt.Sprintf(".%02d", fraction)
	}
	if negative {
		out = "-" + out
	}
	return out
}
