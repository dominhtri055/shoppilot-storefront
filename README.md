# ShopPilot Storefront

Customer-facing Next.js storefront for the ShopPilot merchant dashboard.

## Current scope

- published store profile
- public product listing
- product detail
- local cart
- storefront analytics events
- shared Supabase project with `shoppilot-mobile`

Checkout and payment are intentionally deferred until the transactional order RPC is added to the backend.

## Backend requirement

Merge the dashboard PR that contains:

```text
supabase/migrations/007_add_storefront_foundation.sql
```

Run that migration in the same Supabase project used by the dashboard.

## Setup

Copy the environment file:

```bash
cp .env.example .env.local
```

Fill in:

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
NEXT_PUBLIC_DEFAULT_STORE_SLUG=...
```

Install and run:

```bash
npm install
npm run typecheck
npm run dev
```

Open:

```text
http://localhost:3000
```

or directly:

```text
http://localhost:3000/shop/YOUR_STORE_SLUG
```

## GitHub

Create an empty repository named `shoppilot-storefront`, extract this starter, then run:

```bash
git init
git add .
git commit -m "Build ShopPilot storefront foundation"
git branch -M main
git remote add origin https://github.com/dominhtri055/shoppilot-storefront.git
git push -u origin main
```

## Analytics events

The storefront uses the analytics RPC already created by the dashboard backend:

- `session_started`
- `product_viewed`
- `product_added_to_cart`
- `checkout_started`
- `checkout_completed`

Only the first three are emitted in this foundation phase.
