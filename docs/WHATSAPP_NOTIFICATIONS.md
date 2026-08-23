# WhatsApp Order Notifications

Order lifecycle notifications to customers and admins over the
[Meta WhatsApp Cloud API](https://developers.facebook.com/docs/whatsapp/cloud-api).

## How it works

Handlers never call Meta directly. They write rows to a `notifications` outbox
in the same request that changes the order, and a background worker drains it:

```
handler (order status change)
  └─ services.Notifier.Enqueue  →  notifications table (status=queued)
                                        ↓  every 15s
                          services.NotificationWorker
                                        ↓
                          services.WhatsAppClient.SendTemplate
                                        ↓
                              Meta Graph API  →  status=sent
```

Why an outbox and not a direct call:

- A Meta outage or a slow response can never fail checkout.
- A Railway restart mid-send can never silently drop a message.
- `DedupeKey` (`order:event:channel:recipient`) has a unique index, so the
  double confirmation of a Razorpay payment — `VerifyPayment` from the browser
  *and* the `payment.captured` webhook — produces exactly one message.

Retries use a backoff of 1m → 5m → 15m → 1h → 3h, capped at 5 attempts.
Permanently bad messages (unapproved template, invalid recipient) are failed on
the first attempt instead of retried five times.

## Events

| Event | Fires from | Customer | Admin |
|---|---|---|---|
| `order_placed` | COD order created | ✅ | ✅ |
| `payment_received` | Razorpay verify + webhook | ✅ | ✅ |
| `order_shipped` | Admin sets status `shipped` | ✅ | — |
| `order_delivered` | Admin sets status `delivered` | ✅ | — |
| `order_cancelled` | Admin cancel, or `payment.failed` | ✅ | ✅ |

Admins are not alerted about `shipped`/`delivered` — those are actions they
performed themselves, and alerting someone about their own click is noise.
`processing` sends nothing; it is an internal fulfilment step.

## Templates to submit

Create these in **WhatsApp Manager → Message templates**, category **Utility**,
language **English (`en`)**. The names must match exactly — Meta rejects an
unknown name with a permanent error and the message is dropped, not retried.

### `order_placed`
```
Hi {{1}}, we've received your order {{2}} for ₹{{3}}. We'll let you know as soon as it ships. — The Storee
```
Sample: `Kshitij` · `AB12CD34EF` · `1,299`

### `payment_received`
```
Hi {{1}}, your payment for order {{2}} (₹{{3}}) is confirmed. We're packing it now. — The Storee
```
Sample: `Kshitij` · `AB12CD34EF` · `1,299`

### `order_shipped`
```
Hi {{1}}, your order {{2}} is on its way! Courier: {{3}}. Tracking ID: {{4}}. — The Storee
```
Sample: `Kshitij` · `AB12CD34EF` · `Delhivery` · `1234567890`

When Shiprocket hasn't assigned an AWB yet, {{3}} and {{4}} fall back to
`our courier partner` and `will be shared shortly`.

### `order_delivered`
```
Hi {{1}}, your order {{2}} has been delivered. We'd love to hear what you think! — The Storee
```
Sample: `Kshitij` · `AB12CD34EF`

### `order_cancelled`
```
Hi {{1}}, your order {{2}} has been cancelled. Any payment made will be refunded to the original payment method. — The Storee
```
Sample: `Kshitij` · `AB12CD34EF`

### `admin_order_alert`
```
Storee alert: {{1}} — order {{2}} from {{3}}, ₹{{4}}.
```
Starts with plain text on purpose: Meta rejects a body that begins or ends with
a variable, and a leading emoji is a coin flip on that rule.
Sample: `New COD order` · `AB12CD34EF` · `Kshitij Nawandar` · `1,299`

One template covers every admin alert; {{1}} carries the label
(`New COD order`, `Payment received`, `Order cancelled`).

## Setup

Meta moves this UI around, so trust the names over the exact click paths.

### 0. Pick the phone number first

The number you register **cannot be signed in to the regular WhatsApp or
WhatsApp Business app**. If the Storee number is on WhatsApp Business today, you
must delete that account first (app → Settings → Account → Delete my account),
which permanently destroys its chat history. Using a fresh SIM avoids the
tradeoff entirely, at the cost of customers seeing a number they don't
recognise. Decide this before doing anything else — it's the only irreversible
step here.

### 1. Create the Meta app

developers.facebook.com/apps → **Create app** → name + contact email → use case
**"Connect with customers through WhatsApp"** → select the business portfolio →
**Create app**.

### 2. Connect a WABA and register the number

In the app, open **WhatsApp → API Setup**.

- Create or select the WhatsApp Business Account. Note the **WhatsApp Business
  Account ID**.
- Meta gives you a free **test number** immediately. It can only message up to 5
  recipient numbers you add on the same screen — useful for a smoke test, but it
  cannot message customers.
- **Add phone number** for the real one: display name, category, description →
  verify by SMS or voice OTP → set a **6-digit two-step PIN**. Store that PIN in
  the password manager; re-registering the number later is impossible without
  it.
- Copy the **Phone number ID** — a long numeric ID next to the number, *not* the
  phone number itself. This is `WHATSAPP_PHONE_NUMBER_ID`.

### 3. Start business verification (slow — kick it off early)

business.facebook.com → **Business settings → Security Center → Start
verification**. In India, a GST certificate or Certificate of Incorporation plus
a utility bill or bank statement works; the legal name and address must match
the documents exactly.

Unverified, the number can message **250 unique customers per rolling 24 hours**
— fine at current order volume, but the cap is on unique recipients, not
messages, so it's the number of *customers* notified per day. Verification lifts
it to 1,000 and then scales with quality rating.

### 4. Generate the permanent System User token

business.facebook.com/latest/settings → **Users → System users → Add**.

- Name it something attributable, e.g. `storee-backend`. Role: **Admin**.
- **Assign assets** → the app (**Manage app**, full control) *and* the WABA
  (**Manage WhatsApp Business accounts**, full control). Both. Missing the WABA
  is the usual cause of a token that authenticates but gets permission errors on
  send.
- **Generate new token** → pick the app → tick `whatsapp_business_messaging`,
  `whatsapp_business_management`, `business_management` → expiry **Never**.
- Copy it immediately; it is shown exactly once. This is
  `WHATSAPP_ACCESS_TOKEN`.

The 24-hour token on the app dashboard works for testing but will take
production silently quiet when it expires. Use the System User token.

### 5. Submit the six templates

WhatsApp Manager → **Message templates → Create template**. Category
**Utility**, language **English**, name exactly as listed above (lowercase,
underscores — the code matches on these strings).

Paste the body, fill the sample values for each `{{n}}`, submit. Approval is
usually minutes, occasionally a day.

The dominant rejection reason is `INCORRECT_CATEGORY`, not bad wording. These
six are genuine order-status messages, so Utility is correct — keep it that way
by adding no promotional language. One "Use code SAVE10 on your next order!"
re-categorises the template as Marketing, which costs more and needs separate
opt-in. Also: a body may not begin or end with a variable, and two variables may
not sit adjacent.

### 6. Smoke test before wiring it up

With the test number and your own phone added as a recipient:

```bash
curl -X POST "https://graph.facebook.com/v21.0/$WHATSAPP_PHONE_NUMBER_ID/messages" \
  -H "Authorization: Bearer $WHATSAPP_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "messaging_product": "whatsapp",
    "to": "919876543210",
    "type": "template",
    "template": {
      "name": "order_placed",
      "language": {"code": "en"},
      "components": [{"type":"body","parameters":[
        {"type":"text","text":"Kshitij"},
        {"type":"text","text":"AB12CD34EF"},
        {"type":"text","text":"1,299"}
      ]}]
    }
  }'
```

A `{"messages":[{"id":"wamid...."}]}` response means the token, phone number ID,
and template all line up — which is exactly what the backend does. Check
template status any time with:

```bash
curl "https://graph.facebook.com/v21.0/$WABA_ID/message_templates?fields=name,status,category" \
  -H "Authorization: Bearer $WHATSAPP_ACCESS_TOKEN"
```

### 7. Go live

Set the env vars on Railway and redeploy. Place a real COD test order and watch
the logs for `Notifier: queued order_placed` followed by
`Notification worker: 1 sent`.

## Environment variables

| Variable | Required | Default | Notes |
|---|---|---|---|
| `WHATSAPP_PHONE_NUMBER_ID` | yes | — | From WhatsApp Manager |
| `WHATSAPP_ACCESS_TOKEN` | yes | — | Permanent System User token |
| `WHATSAPP_API_VERSION` | no | `v21.0` | Graph API version |
| `WHATSAPP_TEMPLATE_LANGUAGE` | no | `en` | Must match the approved templates |
| `ADMIN_WHATSAPP_NUMBERS` | no | — | Comma-separated, e.g. `9876543210,9123456789` |
| `NOTIFICATIONS_ENABLED` | no | `true` | Kill switch; set `false` to stop all sends |

With no credentials set the notifier is inactive: nothing is queued, the worker
doesn't start, and every handler behaves exactly as it did before. That is the
intended local-dev and staging state.

## Phone numbers

Checkout collects phone as free text, so `utils.NormalizeIndianPhone` converts
`9876543210` / `+91 98765 43210` / `09876543210` into the digits-only E.164 form
Meta expects (`919876543210`). It accepts Indian mobiles only — a landline,
typo, or foreign number is rejected and the WhatsApp send is skipped with a log
line rather than messaging a stranger. The order itself still goes through.

## Operating it

Everything is visible in the `notifications` table:

```sql
-- what's stuck or gave up
SELECT order_id, event, audience, recipient, attempts, last_error
FROM notifications WHERE status = 'failed' ORDER BY updated_at DESC;

-- re-queue a failed message after fixing the cause (e.g. template approved)
UPDATE notifications SET status = 'queued', attempts = 0, next_run_at = NOW()
WHERE id = '...';
```

## Not included yet

- **Email.** The outbox is channel-tagged and the worker rejects anything that
  isn't `whatsapp`, so email is a second `services` client plus a branch in
  `NotificationWorker.deliver` and an extra row per event in `Notifier.build`.
- **Delivery receipts.** Meta can webhook `sent`/`delivered`/`read` per `wamid`;
  we store the `wamid` in `provider_message_id` but don't consume the callbacks.
- **Explicit opt-in capture.** See the note in the PR/commit — worth adding a
  consent checkbox at checkout.
