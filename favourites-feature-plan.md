# Favourites Feature Plan

This plan follows the current repo standards (Next.js App Router, Prisma, NextAuth, React Context patterns, Tailwind + shadcn/ui) and keeps changes focused on two product-facing additions:

1. Add a favourites heart button on every product card.
2. Add a dedicated page/route listing all favourite products.

## Goals

- Let users mark/unmark products as favourites from product cards.
- Provide a single page where users can view all favourites.
- Keep UX consistent with existing storefront behavior and styling.

## UX Requirements

### Heart button behavior

- Place a heart icon button on each product card (featured + full products grid).
- Empty state: heart outline only (border/outline appearance).
- Selected state: filled heart (solid appearance) after adding to favourites.
- Click toggles favourite state for that product.
- Keep existing Add to Cart behavior unchanged.

### New route/page

- Add route: `/favourites`
- Page title example: `My Favourites`
- Show only products added to favourites.
- If empty, show a friendly empty state with a CTA back to `/#products`.

## Technical Plan

### Phase 1 (MVP, local-first)

Use localStorage first, aligned with existing cart pattern:

- Add `components/favourites-context.tsx`:
  - state: `favouriteProductIds: string[]`
  - methods: `toggleFavourite(productId)`, `isFavourite(productId)`, `clearFavourites()`
  - persist with localStorage key (e.g. `favourites`)
- Register provider in app layout alongside existing providers.
- Update product cards in `app/page.tsx`:
  - render heart button on each card
  - bind visual state to `isFavourite(product.id)`
  - toggle on click
- Add `app/favourites/page.tsx`:
  - fetch products from `/api/products`
  - filter by `favouriteProductIds`
  - render cards with same product-card style and Add to Cart support

### Phase 2 (Authenticated persistence, optional next)

Move favourites to backend for cross-device persistence:

- Prisma `Favorite` model with unique `[userId, productId]`.
- API routes:
  - `GET /api/favourites`
  - `POST /api/favourites`
  - `DELETE /api/favourites/:productId`
- When signed in, sync local + server favourites with conflict-safe merge.

## File Change Plan

- `components/favourites-context.tsx` (new)
- `app/page.tsx` (heart button on product cards)
- `app/favourites/page.tsx` (new favourites list page)
- `app/layout.tsx` (wrap with favourites provider)
- `__tests__/...` add/update tests for:
  - toggle behavior (outline vs filled heart state)
  - favourites page rendering and empty state

## Routing and Navigation

- Add a navigation entry to `/favourites` where appropriate (header/profile menu) without removing existing links.
- Preserve current `/`, `/admin`, `/auth/*`, and `/checkout/success` routes.

## Validation Checklist

- `pnpm lint`
- `pnpm typecheck`
- targeted Jest tests for favourites context + favourites page
- final `pnpm test`

## Acceptance Criteria

- Every product card has a working heart toggle.
- Heart state visibly switches between outline and filled.
- `/favourites` page lists only selected products.
- Empty favourites state is handled cleanly.
- Existing storefront/cart/admin flows continue to work.
