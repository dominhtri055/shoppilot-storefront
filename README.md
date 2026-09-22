# ShopPilot Storefront

A customer-facing **Next.js + TypeScript** storefront connected to the ShopPilot merchant platform. It turns merchant-managed store and product data into a public browsing experience while recording storefront analytics back into the shared Supabase backend.

## Current Scope

- Published store profile
- Public product catalogue
- Product detail views
- Local cart workflow
- Store-slug based routing
- Storefront analytics events
- Shared Supabase data model with the ShopPilot merchant dashboard
- Responsive web UI

Checkout and payment are intentionally outside the current MVP until the backend transactional order workflow is completed.

## Engineering Highlights

- Uses a separate customer-facing application while sharing the ShopPilot backend and merchant-owned data model
- Resolves published storefronts by store slug
- Keeps cart state on the client for the current MVP
- Sends storefront behavior into the analytics pipeline used by ShopPilot Insights
- Separates storefront concerns from the merchant operations dashboard
- Includes linting, type checking, and production build scripts

## Analytics

The storefront integrates with the ShopPilot analytics pipeline. Supported event types include:

- `session_started`
- `product_viewed`
- `product_added_to_cart`
- `checkout_started`
- `checkout_completed`

The current storefront emits the events implemented for the MVP browsing/cart flow, while checkout-related events are reserved for the future transactional checkout workflow.

## Tech Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- Supabase-backed ShopPilot data and analytics

## Relationship to ShopPilot

The storefront is the customer-facing half of the wider ShopPilot project:

- **Merchant app:** products, inventory, orders, store settings, storage, and analytics
- **Storefront:** public store browsing, product discovery, cart behavior, and customer analytics events

Merchant application: https://github.com/dominhtri055/shoppilot-mobile

## Local Development

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Copy the example environment file:

```bash
cp .env.example .env.local
```

Then provide the ShopPilot Supabase values:

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
NEXT_PUBLIC_DEFAULT_STORE_SLUG=...
```

### 3. Run locally

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

or a specific published storefront:

```text
http://localhost:3000/shop/YOUR_STORE_SLUG
```

## Validation

```bash
npm run lint
npm run typecheck
npm run build
```

## Project Status

This repository represents the current storefront MVP. Product browsing, cart behavior, and analytics are implemented; transactional checkout is intentionally deferred until the backend order-creation flow is ready.

## Author

**Tri Do**

- Portfolio: https://tri-portfolio-pi.vercel.app/
- GitHub: https://github.com/dominhtri055
- LinkedIn: https://www.linkedin.com/in/trido2908/
## Store designer

Open `/customize` to sign in with an existing ShopPilot merchant email/password or try the device-local demo. The customer storefront uses the same rendering components as the designer preview.

- Three starting styles: Studio, Editorial, Electric.
- Brand and background colors with automatic contrasting text, sans/serif typography, soft/square cards.
- Announcement, hero headline/body, HTTPS banner image URL, and story content.
- Split/centered hero, desktop grid columns, section ordering, and visibility controls.
- Separate **Save draft** and **Publish design** actions. Publishing the design does not change the store's publication status in ShopPilot Mobile.
- Desktop/mobile preview, reset and restore-published actions, and unsaved-change navigation warning.

### Enable durable merchant customization

Apply `supabase/migrations/009_storefront_customization.sql` to the **existing shared Supabase project**, after ShopPilot Mobile migrations 001–007. This adds `storefront_themes` with owner-only row-level security and a public RPC that exposes only the published design of a published store. No service-role key is used. Existing stores retain the default appearance if the new RPC is not installed yet; merchant sign-in surfaces a setup error until the migration is applied.

Use the existing `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` values. Keep the existing `NEXT_PUBLIC_DEFAULT_STORE_SLUG` for the root redirect. Store identity, logo and product management remain in ShopPilot Mobile. The editor reads the owner's active, in-stock products through authenticated RLS, so private stores can be previewed before publication.

Merchant access tokens live only in memory; reloading the editor requires signing in again. Drafts live in Supabase. **Try the demo** never writes to Supabase: its saved settings are stored only on the current device. Banner images are supplied as HTTPS URLs; this version does not upload image files.

### Validation

```sh
npm run build
node --experimental-strip-types --test tests/theme.test.mjs
```

The RLS integration test uses an isolated PostgreSQL-compatible PGlite database, not the connected production database. Install `@electric-sql/pglite` in a temporary directory and provide its module path:

```sh
npm install --prefix /tmp/shoppilot-qa --no-package-lock @electric-sql/pglite
PGLITE_MODULE=/tmp/shoppilot-qa/node_modules/@electric-sql/pglite/dist/index.js node tests/theme-rls.mjs
```

It checks cross-owner reads/writes, anonymous draft access, unpublished store privacy, and draft/published separation. The migration and real account sign-in must still be verified against the connected Supabase project before release.


### Dashboard integration

The companion merchant app now has a protected **Dashboard → Design website** screen using its existing session. It shares the same draft/published JSON contract and database table as `/customize`. Deploy both repositories after applying migration 009 once to the shared Supabase project. Migration 008_clear_demo_data in the mobile repository is unrelated and must not be run as part of this rollout. See the merchant repository’s `WEBSITE_DESIGN_SETUP.md` for release steps.
