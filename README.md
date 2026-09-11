# SADA social platform

SADA is a social entertainment client and API for voice rooms, messaging, games,
activities, virtual goods, VIP, player trading, payments, and safety. It runs on
vinext/Cloudflare Workers with a D1 database and Drizzle-managed migrations.

Backend setup and route inventory: [`docs/backend-api.md`](docs/backend-api.md).

## Prerequisites

- Node.js `>=22.13.0`

## Quick Start

```bash
npm install
npm run db:migrate:local
npm run db:seed:local
npm run dev
```

Open <http://localhost:3000>. The local seed creates representative SADA data
for the product and admin surfaces.

## Project shape

- `app/`: product UI, admin UI, and `/api/v1` request handlers
- `server/`: shared API validation, authentication, and response helpers
- `db/` and `drizzle/`: D1 schema, migrations, and local seed data
- `worker/`: Cloudflare Worker entry point
- `desktop/`: Electron shell for the macOS desktop client
- `.openai/hosting.json`: Sites project and D1 binding
- `wrangler.jsonc`: direct Cloudflare Worker and D1 configuration

## Environment

Copy `.dev.vars.example` to `.dev.vars` for local provider integration. Local
development can use simulated OTP and payment confirmation; production cannot.
Never commit `.dev.vars` or provider secrets.

The D1 ID in `wrangler.jsonc` is intentionally a local placeholder. Before a
direct Cloudflare production deployment, create `sada-social-db` and replace the
placeholder with the real database ID. See
[`docs/launch-checklist.md`](docs/launch-checklist.md) for the remaining
account-owned launch inputs.

## Workspace Auth Headers

Signed-in visitors receive both `oai-authenticated-user-id` and `oai-authenticated-user-email`. Private Sites require every visitor to sign in; public Sites may also have anonymous visitors, for whom neither header is present.

The user ID is stable for the same user on the same Site and different across Sites. Email and name are intended for display or contact purposes.

SIWC-authenticated workspace sites may also receive
`oai-authenticated-user-full-name` when the user's SIWC profile has a non-empty
`name` claim. The full-name value is percent-encoded UTF-8 and is accompanied by
`oai-authenticated-user-full-name-encoding: percent-encoded-utf-8`.

Treat the full name as optional and fall back to email when it is absent:

```tsx
import { headers } from "next/headers";

export default async function Home() {
  const requestHeaders = await headers();
  const userId = requestHeaders.get("oai-authenticated-user-id");
  const email = requestHeaders.get("oai-authenticated-user-email");
  const encodedFullName = requestHeaders.get("oai-authenticated-user-full-name");
  const fullName =
    encodedFullName &&
    requestHeaders.get("oai-authenticated-user-full-name-encoding") ===
      "percent-encoded-utf-8"
      ? decodeURIComponent(encodedFullName)
      : null;

  const displayName = fullName ?? email;
  // ...
}
```

## Optional Dispatch-Owned ChatGPT Sign-In

Import the ready-to-use helpers from `app/chatgpt-auth.ts` when the site needs
optional or required ChatGPT sign-in:

- Use `getChatGPTUser()` for optional signed-in UI.
- Use `requireChatGPTUser(returnTo)` for server-rendered pages that should send
  anonymous visitors through Sign in with ChatGPT.
- Use `chatGPTSignInPath(returnTo)` and `chatGPTSignOutPath(returnTo)` for
  browser links or actions.
- Pass a same-origin relative `returnTo` path for the destination after sign-in
  or sign-out. The helper validates and safely encodes it.
- Mark protected pages with `export const dynamic = "force-dynamic"` because
  they depend on per-request identity headers.

Dispatch owns `/signin-with-chatgpt`, `/signout-with-chatgpt`, `/callback`, the
OAuth cookies, and identity header injection. Do not implement app routes for
those reserved paths. Routes that do not import and call the helper remain
anonymous-compatible.

SIWC establishes identity only; it does not prove workspace membership. Use the
Sites hosting platform's access policy controls for workspace-wide restrictions,
or enforce explicit server-side membership or allowlist checks.

Use SIWC for account pages, user-specific dashboards, saved records, and write
actions tied to the current ChatGPT user. Leave public content anonymous.

## Useful Commands

- `npm run dev`: start local development
- `npm run build`: verify the vinext build output
- `npm run lint`: run static checks
- `npm test`: build and run rendered UI and backend contract tests
- `npm run check`: run the complete CI verification
- `npm run db:generate`: generate Drizzle migrations after schema changes
- `npm run db:migrate:local`: apply D1 migrations locally
- `npm run db:seed:local`: add representative local data
- `npm run db:migrate:remote`: apply D1 migrations to the configured remote database

## Learn More

- [vinext Documentation](https://github.com/cloudflare/vinext)
- [Drizzle D1 Guide](https://orm.drizzle.team/docs/get-started/d1-new)
