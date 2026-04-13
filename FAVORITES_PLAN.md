# Favorites Feature — Implementation Plan

This document outlines the plan for adding a favorites feature to the Sweet Dreams Bakery app. It is organized into two phases that correspond to the open issues in this repository.

## Related Issues

- **Issue #7** — _POC: Explore what a favorites feature might look like_ (Phase 1)
- **Issue #2** — _Add a favorites feature_ (Phase 2)

---

## Phase 1 — Proof of Concept (Issue #7)

The goal of Phase 1 is to build a working proof of concept using **browser localStorage** for persistence (no database changes). This lets us validate the UX before investing in backend work.

### 1.1 Create a Favorites Context

Create `components/favorites-context.tsx`, following the same pattern used by the existing `components/cart-context.tsx`.

**Responsibilities:**

- Maintain a list of favorited product IDs in React state.
- Persist the list to `localStorage` under the key `"favorites"`.
- Expose the following via context:
  - `favorites: string[]` — array of product IDs.
  - `addFavorite(productId: string): void` — add a product to favorites.
  - `removeFavorite(productId: string): void` — remove a product from favorites.
  - `toggleFavorite(productId: string): void` — toggle a product's favorite status.
  - `isFavorite(productId: string): boolean` — check whether a product is favorited.
- Load saved favorites from `localStorage` on mount.
- Write updated favorites to `localStorage` whenever the list changes.

### 1.2 Register the Provider

In `app/layout.tsx`, wrap the application with `<FavoritesProvider>` alongside the existing `<CartProvider>` and `<SessionProvider>`.

### 1.3 Add a Favorite Toggle to Product Cards

On the homepage (`app/page.tsx`), add a heart icon button to each product card.

- Use the `Heart` icon from `lucide-react`.
- Filled/solid heart when the product is in favorites; outline when it is not.
- Clicking the icon calls `toggleFavorite(product.id)`.
- The button should appear in the top-right corner of the product image, similar to how the "Out of Stock" badge is positioned.

### 1.4 Create a "My Favorites" Page

Create a new page at `app/favorites/page.tsx`.

**Requirements:**

- Display all favorited products in a grid layout consistent with the main product catalog.
- Each product card should show the same information as the homepage product card (image, name, description, price).
- Include a heart button to remove items from favorites.
- Include an "Add to Cart" button on each card.
- Show an empty state message when there are no favorites (e.g., "You haven't added any favorites yet.").
- Products are fetched from the existing `/api/products` endpoint and filtered client-side to show only favorited items.

### 1.5 Add a Favorite Toggle to the Cart / Checkout Sidebar

In the cart sidebar (`components/cart-sidebar.tsx`), each cart item uses a compact horizontal layout (thumbnail, name/price, quantity controls). Add a heart icon button to each cart item row so users can favorite products while reviewing their order.

- Place a small heart icon button next to the existing remove (trash) button in each cart item row.
- Use the same filled/outline heart states as the product cards.
- Clicking the heart calls `toggleFavorite(item.id)`.
- This ensures users can save items they like during checkout without leaving the flow.

### 1.6 Add Navigation Link

Add a "My Favorites" link to the navigation bar in the header (`app/page.tsx`), next to the existing Home / Products / About / Contact links. Also consider adding a heart icon with a badge count next to the cart icon.

### 1.7 Tests

Add tests following the patterns in the existing test suite:

- **`__tests__/favorites-context.test.tsx`** — Unit tests for the `FavoritesContext`, modeled after `__tests__/cart-context.test.tsx`. Cover:
  - Adding a favorite.
  - Removing a favorite.
  - Toggling a favorite.
  - Checking `isFavorite`.
  - Persistence to `localStorage`.
  - Loading from `localStorage` on mount.

### Phase 1 File Changes Summary

| Action | File |
|--------|------|
| Create | `components/favorites-context.tsx` |
| Modify | `app/layout.tsx` — add `FavoritesProvider` |
| Modify | `app/page.tsx` — add heart toggle to product cards, add nav link |
| Modify | `components/cart-sidebar.tsx` — add heart toggle to cart items |
| Create | `app/favorites/page.tsx` — favorites page |
| Create | `__tests__/favorites-context.test.tsx` |

---

## Phase 2 — Full Feature (Issue #2)

Phase 2 upgrades the proof of concept to a database-backed implementation so that favorites persist across devices for logged-in users.

### 2.1 Update the Database Schema

Add a `Favorite` model to `prisma/schema.prisma`:

```prisma
model Favorite {
  id        String   @id @default(cuid())
  userId    String
  productId String
  createdAt DateTime @default(now())
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  product   Product  @relation(fields: [productId], references: [id], onDelete: Cascade)

  @@unique([userId, productId])
}
```

Also add the corresponding relation fields to the existing `User` and `Product` models:

- `User`: add `favorites Favorite[]`
- `Product`: add `favorites Favorite[]`

Run `npx prisma migrate dev` to generate and apply the migration.

### 2.2 Add Database Helper Functions

Add functions to `lib/database.ts`:

- `getFavoritesByUser(userId: string)` — return all favorites for a user, including product data.
- `addFavorite(userId: string, productId: string)` — create a favorite record.
- `removeFavorite(userId: string, productId: string)` — delete a favorite record.
- `isFavorite(userId: string, productId: string)` — check if a product is favorited by a user.

### 2.3 Create API Endpoints

Create the following API routes:

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/favorites` | Get the current user's favorites |
| POST | `/api/favorites` | Add a product to favorites (`{ productId }`) |
| DELETE | `/api/favorites` | Remove a product from favorites (`{ productId }`) |

All endpoints should require authentication (check the session). Return `401` if the user is not logged in.

### 2.4 Update the Favorites Context

Modify `components/favorites-context.tsx` to support a hybrid approach:

- **Logged-in users**: Fetch favorites from the API on mount, and sync add/remove actions to the API. Optionally also cache in `localStorage` for faster initial rendering.
- **Guest users**: Continue using `localStorage` only (Phase 1 behavior).

Use the `useSession` hook from `next-auth/react` to determine the authentication state.

### 2.5 Additional UX Enhancements

- Show a toast notification when a product is added or removed from favorites.
- Show the favorites count as a badge on the navigation heart icon.
- On the "My Favorites" page, add sorting/filtering options consistent with the main catalog.

### Phase 2 File Changes Summary

| Action | File |
|--------|------|
| Modify | `prisma/schema.prisma` — add `Favorite` model |
| Create | `prisma/migrations/…` — generated migration |
| Modify | `lib/database.ts` — add favorite DB functions |
| Create | `app/api/favorites/route.ts` — API endpoints |
| Modify | `components/favorites-context.tsx` — add API sync |
| Modify | `app/favorites/page.tsx` — UX enhancements |

---

## Implementation Order

1. Start with **Phase 1** to get quick feedback on the UX.
2. Once the POC is validated, proceed to **Phase 2** for full persistence.
3. Each phase can be delivered as a separate pull request.
