# SADA backend API

The versioned API lives under `/api/v1`. Responses use either `{ "data": ... }` or
`{ "error": { "code", "message", "requestId" } }`. Authenticated endpoints accept
`Authorization: Bearer <token>`, the `sada_session` HttpOnly cookie, or the identity
headers injected by Sign in with ChatGPT on Sites.

## Local setup

```bash
npm run db:migrate:local
npm run db:seed:local
npm run dev
```

In local development, `POST /api/v1/auth/otp/request` returns `developmentCode`.
The payment confirmation demo code is `123456`. Neither code is returned/accepted
when `SADA_ENV=production`; configure the SMS and payment provider environment
variables described below.

## Routes

| Area | Routes |
| --- | --- |
| Health | `GET /health` |
| Auth | `POST /auth/otp/request`, `POST /auth/otp/verify`, `POST /auth/logout` |
| Account | `GET/PATCH /me`, `GET /users`, `POST/DELETE /users/:id/follow` |
| Voice rooms | `GET/POST /rooms`, `GET /rooms/:id`, `POST /rooms/:id/join`, `POST /rooms/:id/leave`, `GET/POST /rooms/:id/messages`, `POST /rooms/:id/gifts` |
| Direct messages | `GET/POST /conversations`, `GET/POST /conversations/:id/messages` |
| Growth | `GET /activities`, `POST /activities/check-in`, `POST /activities/:id/claim` |
| Economy | `GET /catalog`, `GET /inventory`, `POST /inventory/:id/equip`, `POST /store/purchases`, `POST /vip/upgrade` |
| Marketplace | `GET/POST /market/listings`, `POST /market/listings/:id/buy`, `GET /market/orders` |
| Payments | `GET/POST /payments/methods`, `DELETE /payments/methods/:id`, `POST /payments/intents`, `POST /payments/intents/:id/confirm`, `POST /payments/webhooks/provider`, `GET /payments/receipts`, `POST /payments/receipts/:id/refunds` |
| Safety | `GET/PATCH /safety/preferences`, `POST /reports` |
| Admin | `GET /admin/overview`, `GET /admin/users`, `PATCH /admin/users/:id`, `PATCH /admin/rooms/:id`, `PATCH /admin/reports/:id` |

All money-changing requests require an `idempotencyKey`. Wallet deductions use
conditional updates, and listings use a conditional state transition so two buyers
cannot purchase the same item. Payment methods accept only provider-tokenized
references; raw card/account numbers are rejected.

## Production environment

- `SADA_ENV=production`
- `SADA_TRUST_OAI_HEADERS=true` only on OpenAI Sites/Dispatch where those headers
  are platform-injected and stripped from public client requests; keep it `false`
  for direct Workers deployments
- `SMS_PROVIDER_URL` and optionally `SMS_PROVIDER_TOKEN`
- `PAYMENT_PROVIDER_URL` and optionally `PAYMENT_PROVIDER_TOKEN`
- `PAYMENT_WEBHOOK_SECRET` for signed payment settlement events
- `SADA_ADMIN_EMAILS` as a comma-separated administrator allowlist and/or `SADA_ADMIN_TOKEN` for service access
- D1 binding name: `DB`

The browser admin is available at `/admin`. Local development permits a local
administrator only when no admin email allowlist or token is configured. Production
always requires an allowlisted workspace identity or the service token.

Production payment confirmation moves the intent to `processing`; it does not add
Diamonds. The provider must send `POST /api/v1/payments/webhooks/provider` with a
JSON body containing `paymentId`, `providerReference`, and `status` (`succeeded`
or `failed`). Sign the exact body using HMAC-SHA256 over
`<unix_timestamp>.<raw_body>` and send `x-sada-signature: t=<timestamp>,v1=<hex>`.
Events older than five minutes and invalid signatures are rejected. Settlement is
idempotent, so provider retries cannot credit the wallet twice.

The provider adapter is deliberately generic so Easypaisa, JazzCash, or a card
processor can be selected without changing the client contract. The provider's
method token—not a raw card or account number—is sent when creating the intent.
