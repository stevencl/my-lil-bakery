# Favorites Feature — Implementation Plan

## Overview

Allow users to mark products as favorites so they can quickly find and reorder items they love. The feature follows the same architectural patterns already used in the app (React Context for client state, Prisma/SQLite for persistence, NextAuth for authentication, shadcn/ui components).

---

## 1. Data Model

### 1a. Prisma Schema — add a `Favorite` model

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

Add corresponding relation fields to the existing models:

- `User` — add `favorites Favorite[]`
- `Product` — add `favorites Favorite[]`

### 1b. Migration

Run `npx prisma migrate dev --name add-favorites` to generate and apply the migration.

---

## 2. Database Helper Functions (`lib/database.ts`)

Add the following functions alongside the existing product/order helpers:

| Function | Purpose |
|---|---|
| `getUserFavorites(userId)` | Return all favorited products (with category) for a user |
| `addFavorite(userId, productId)` | Create a Favorite row (upsert to avoid duplicates) |
| `removeFavorite(userId, productId)` | Delete the Favorite row |
| `isFavorite(userId, productId)` | Return boolean indicating if a product is favorited |

---

## 3. API Routes (`app/api/favorites/`)

### `GET /api/favorites`

- Requires authentication (return 401 otherwise).
- Returns the list of the current user's favorite products.

### `POST /api/favorites`

- Body: `{ productId: string }`
- Adds a product to the current user's favorites.
- Returns the created favorite or 409 if it already exists.

### `DELETE /api/favorites`

- Body or query param: `{ productId: string }`
- Removes a product from the current user's favorites.
- Returns 200 on success, 404 if the favorite was not found.

---

## 4. Client-Side State — `FavoritesContext` (`components/favorites-context.tsx`)

Follow the same pattern as the existing `CartContext`:

```tsx
interface FavoritesContextType {
  favorites: string[]            // Array of product IDs
  toggleFavorite: (productId: string) => void
  isFavorite: (productId: string) => boolean
  isLoading: boolean
}
```

### Behavior

| Scenario | Storage | Sync |
|---|---|---|
| **Logged-in user** | Server-side via API routes; local state updated optimistically | Fetch on mount and after sign-in |
| **Guest user** | `localStorage` key `"favorites"` | Migrate to server on sign-in |

On sign-in, merge any guest favorites into the user's server-side favorites and clear `localStorage`.

### Provider Placement

Wrap the app in `FavoritesProvider` inside `app/layout.tsx`, nested inside `SessionProvider` and `CartProvider` (similar to how `CartProvider` is already set up).

---

## 5. UI Components

### 5a. Favorite Toggle Button (`components/favorite-button.tsx`)

- A heart icon button (use `Heart` from `lucide-react`).
- Filled/colored when the product is in favorites, outlined when not.
- Calls `toggleFavorite(productId)` on click.
- Shows a brief toast notification via `sonner` ("Added to favorites" / "Removed from favorites").
- If the user is not signed in, prompt them to sign in (link to `/auth/signin`).

### 5b. Product Cards (update `app/page.tsx`)

- Add the `FavoriteButton` to each product card in the product grid — position it at the top-right corner of the card.

### 5c. Favorites Page (`app/favorites/page.tsx`)

- A dedicated `/favorites` route displaying the user's favorite products in a grid (reuse the same product card layout from the home page).
- Empty state with a message and a link back to the product catalog when there are no favorites.
- Requires authentication — redirect unauthenticated users to sign in.

### 5d. Navigation Link

- Add a "Favorites" link (with a `Heart` icon) to the main navigation bar in the header.
- Show a badge count of the number of favorited items (similar to how a cart count might be shown).

---

## 6. Tests

Follow the existing Jest + React Testing Library patterns found in `__tests__/`.

| Test File | Coverage |
|---|---|
| `__tests__/favorites-context.test.tsx` | Context provider behavior: add, remove, toggle, persistence to `localStorage` for guests |
| `__tests__/favorite-button.test.tsx` | Renders correct icon state, calls toggle on click, shows sign-in prompt for guests |
| `__tests__/favorites-page.test.tsx` | Displays favorite products, handles empty state, requires auth |

---

## 7. Implementation Order

1. **Schema & Migration** — Update `prisma/schema.prisma`, run migration.
2. **Database Helpers** — Add favorites functions to `lib/database.ts`.
3. **API Routes** — Create `app/api/favorites/route.ts` with GET, POST, DELETE.
4. **Favorites Context** — Create `components/favorites-context.tsx`, add provider to layout.
5. **Favorite Button Component** — Create `components/favorite-button.tsx`.
6. **Update Product Cards** — Add the favorite button to product cards on the home page.
7. **Favorites Page** — Create `app/favorites/page.tsx`.
8. **Navigation Update** — Add Favorites link to the header nav.
9. **Tests** — Write unit/integration tests.
10. **Manual QA** — Verify end-to-end flow (guest & authenticated) and responsive design.

---

## 8. Edge Cases & Considerations

- **Deleted products** — The `onDelete: Cascade` on the `Favorite.product` relation ensures favorites are cleaned up automatically when a product is deleted.
- **Duplicate favorites** — The `@@unique([userId, productId])` constraint prevents duplicates at the database level; the API should handle the conflict gracefully.
- **Optimistic UI** — Toggle the heart icon immediately on click and revert if the API call fails, for a snappy user experience.
- **Guest-to-authenticated migration** — When a guest signs in, merge `localStorage` favorites into the database and clear local storage to avoid stale data.
- **Performance** — Fetch favorites once on mount (or session change) and keep them in context; avoid per-card API calls.
- **Accessibility** — The favorite button should have an `aria-label` ("Add to favorites" / "Remove from favorites") and be keyboard-navigable.
