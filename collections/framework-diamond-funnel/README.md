# Framework Diamond Funnel

Webhook events fired during the diamond funnel lifecycle. The funnel guides a lead through 3 classes and a checkout, tracking engagement at each step.

## Funnel Flow

```
Lead ─► Class 1 ─► Class 2 ─► Class 3 ─► Checkout ─► Won
         │           │           │           │
         ▼           ▼           ▼           ▼
    not_initiated  not_initiated  not_initiated  not_initiated
                                               abandoned
```

## Events

| # | Event | Trigger |
|---|-------|---------|
| 1 | `spyhub.diamond.lead` | User enters the funnel |
| 2 | `spyhub.diamond.class_1_not_initiated` | User did not start class 1 (after timer) |
| 3 | `spyhub.diamond.class_1_concluded` | User completed class 1 |
| 4 | `spyhub.diamond.class_2_not_initiated` | User did not start class 2 (after timer) |
| 5 | `spyhub.diamond.class_2_concluded` | User completed class 2 |
| 6 | `spyhub.diamond.class_3_not_initiated` | User did not start class 3 (after timer) |
| 7 | `spyhub.diamond.class_3_concluded` | User completed class 3 |
| 8 | `spyhub.diamond.checkout_not_initiated` | User did not start checkout (after timer) |
| 9 | `spyhub.diamond.checkout_initiated` | User opened the checkout page |
| 10 | `spyhub.diamond.checkout_abandoned` | User abandoned checkout (after timer) |
| 11 | `spyhub.diamond.won` | User completed the purchase |

## Payload Structure

All events share the same payload shape — only the `event` field changes.

### `data.user`

| Field | Type | Description |
|-------|------|-------------|
| `id` | integer | Internal user ID |
| `first_name` | string | First name |
| `name` | string | Full name |
| `email` | string | Email address |
| `document` | string\|null | CPF or ID document |
| `phone` | string\|null | Mobile phone |
| `magic_login_url` | string | One-click login URL |
| `magic_login_token` | string | Encoded token for direct authentication |
| `src.utm_source` | string\|null | UTM source |
| `src.utm_medium` | string\|null | UTM medium |
| `src.utm_campaign` | string\|null | UTM campaign |
| `src.utm_term` | string\|null | UTM term |
| `src.utm_content` | string\|null | UTM content |
| `access.first_at` | object | First access — `{ unix, iso }` |
| `access.last_at` | object | Last access — `{ unix, iso }` |
| `created.at` | object | Account creation — `{ unix, iso }` |

### `data.framework`

| Field | Type | Description |
|-------|------|-------------|
| `id` | integer | Framework (funnel) ID |
| `links.login` | string\|null | Login URL |
| `links.class_1` | string\|null | Class 1 URL (encrypted token) |
| `links.class_2` | string\|null | Class 2 URL (encrypted token) |
| `links.class_3` | string\|null | Class 3 URL (encrypted token) |
| `links.checkout` | string\|null | Checkout URL (encrypted token) |
| `whatsapp.active` | boolean | WhatsApp messaging enabled |
| `whatsapp.message` | string | WhatsApp message template |
| `sms.active` | boolean | SMS messaging enabled |
| `sms.message` | string | SMS message template |
| `email.active` | boolean | Email messaging enabled |
| `email.sender` | string\|null | Sender address |
| `email.reply_to` | string | Reply-to address |
| `email.subject` | string\|null | Email subject (custom per step) |
| `email.text` | string\|null | Email body (custom per step) |
| `email.tags` | string[] | Email tracking tags |

## HTTP Details

- **Method:** `POST`
- **Content-Type:** `application/json`
- **Retry:** up to 6 attempts with exponential backoff
