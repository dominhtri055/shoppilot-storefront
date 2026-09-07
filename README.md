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