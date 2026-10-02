# Warfare X Store (Rust Console Edition)

A Next.js storefront and admin dashboard for the Warfare X Rust Console Edition community. Players sign in with Discord, choose a server/account-linked credit package, and pay through Stripe. A signed Stripe webhook confirms payment and atomically credits the linked player in Supabase. This is a store—not an RCON client or Discord bot.

## Stack

- Next.js 15 / React 19 / TypeScript
- Supabase Auth (Discord OAuth) and Postgres
- Stripe Checkout and signed webhooks
- Railway deployment

## Local setup

Use Node.js 22 and pnpm 9 or newer. Copy .env.example to .env.local, fill in the values, then run pnpm install --frozen-lockfile and pnpm dev. Run pnpm typecheck and pnpm build before release.

## Supabase setup

On a fresh Supabase project, run these SQL files in order:

1. scripts/01-schema.sql
2. scripts/05-store-fulfillment.sql
3. scripts/06-store-security.sql

scripts/02-seed.sql inserts development sample data only; do not run it on a live store. Scripts 03 and 04 are optional Pixel War setup.

The game-server integration must read the canonical lowercase tables economy_balance and economy_transactions. Keep its service-role key on the server only; never put it in browser code. A verified mapping in username_links is required before checkout.

Enable Discord as an OAuth provider in Supabase. Set the Discord OAuth provider callback to Supabase's /auth/v1/callback URL, and add APP_URL/auth/callback to Supabase's allowed redirect URLs.

## Railway variables

Set these in Railway's service Variables (do not commit real secrets):

- APP_URL — the public Railway origin
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY — private server-side secret
- ADMIN_DISCORD_IDS — comma-separated Discord snowflakes authorized for admin APIs
- STRIPE_SECRET_KEY
- STRIPE_WEBHOOK_SECRET
- DISCORD_WEBHOOK_URL — optional notification webhook

Railway uses railway.json to install, build, start the app, and check /api/health. Configure a Stripe webhook to https://<your-railway-host>/api/stripe/webhook for checkout.session.completed (and checkout.session.async_payment_succeeded if async methods are added). Put the signing secret into Railway's STRIPE_WEBHOOK_SECRET. Test with Stripe test keys before switching to live mode.

## Payment and fulfillment flow

1. A signed-in Discord user must have a verified username_links record for the selected active server.
2. The server creates a pending row in transactions and starts Stripe Checkout; price and credits come from the database, not client input.
3. Stripe's signature-verified webhook calls fulfill_paid_store_transaction. The SQL function checks the paid amount, locks the transaction, increments the player balance atomically, records an economy transaction, and is idempotent for webhook retries.
4. The success page verifies the user's own Stripe session. If the link is missing, the order remains paid but marked pending delivery; relink the account and retry verification or fulfill it administratively.

## Admin access

Set ADMIN_DISCORD_IDS for server-side authorization. If the admin-only navigation should be visible, also set NEXT_PUBLIC_ADMIN_DISCORD_IDS to the same comma-separated IDs; that list is visible to users and is not a secret. Admin UI visibility is not authorization—the API still checks the configured ID list.

## Discord merge notification

The GitHub workflow reads DISCORD_MERGE_WEBHOOK_URL from repository Actions secrets. Do not put a Discord webhook URL in source. The previous workflow exposed a webhook; rotate/revoke that webhook in Discord before using this repository.
