# SADA launch checklist

This checklist separates repository work that is already present from account- or
provider-owned values that must be supplied before a production launch.

## Ready in the repository

- [x] Production build, TypeScript check, lint, and automated contract tests
- [x] GitHub Actions CI for pushes and pull requests
- [x] Cloudflare Worker entry point and D1 migrations
- [x] Local D1 migration and seed commands
- [x] Example environment file with secrets excluded from Git
- [x] Sign in with ChatGPT identity support
- [x] Phone OTP UI connected to the API and HttpOnly session cookie
- [x] Production identity headers disabled unless the trusted platform boundary is explicitly enabled
- [x] Same-origin enforcement for cookie-authenticated mutations
- [x] Payment intents, provider confirmation, signed webhook settlement, receipts, and refund UI
- [x] Admin access control, safety APIs, payment idempotency, and rate limits
- [x] macOS desktop packaging scripts and application artwork

## Account values still required

- [ ] Connect the GitHub account, create a private `sada-social` repository, and
      add it as `origin`
- [ ] Create the Cloudflare D1 database `sada-social-db`; replace the placeholder
      `database_id` in `wrangler.jsonc` with the ID returned by Cloudflare
- [ ] Apply migrations with `npm run db:migrate:remote`
- [ ] Set `SADA_ENV=production`
- [ ] Set `SADA_ADMIN_EMAILS` to the real administrator email address(es)
- [ ] Generate and store a strong `SADA_ADMIN_TOKEN` only if service access is needed
- [ ] Select an SMS provider and set `SMS_PROVIDER_URL` and `SMS_PROVIDER_TOKEN`
- [ ] Select a payment provider and set `PAYMENT_PROVIDER_URL`,
      `PAYMENT_PROVIDER_TOKEN`, and `PAYMENT_WEBHOOK_SECRET`; configure its webhook
      destination as `/api/v1/payments/webhooks/provider`
- [ ] Configure the production domain, access policy, privacy policy, terms,
      support address, and account-deletion route
- [ ] Configure monitoring, error alerts, database backups, and a rollback owner
- [ ] Complete App Store/notarization signing if distributing the macOS client

## Release gate

Run these commands from the project directory:

```bash
npm ci
npm run check
npm run release:check
npm run db:migrate:remote
```

Then verify `/api/v1/health`, login, one room lifecycle, one message, one report,
one payment-provider sandbox transaction, admin access, and logout in production.
