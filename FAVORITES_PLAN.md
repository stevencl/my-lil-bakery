# Favorites Feature Plan

## Overview

Add a favorites (wishlist) feature that lets authenticated users mark bakery products as favorites, view them on a dedicated page, and quickly add favorited items to their cart.

---

## 1. Database Changes

### New Prisma Model

Add a `Favorite` model to `prisma/schema.prisma` to persist user favorites server-side:

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

Update the `User` and `Product` models to include the reverse relation:

```prisma
model User {
  // ... existing fields
  favorites Favorite[]
}

model Product {
  // ... existing fields
  favorites Favorite[]
}
```

### Migration

Run `npx prisma migrate dev --name add-favorites` to generate and apply the migration.

---

## 2. API Routes

Create RESTful API routes under `app/api/favorites/`:

| Method | Route                        | Description                                  | Auth Required |
| ------ | ---------------------------- | -------------------------------------------- | ------------- |
| GET    | `/api/favorites`             | List all favorites for the authenticated user | Yes           |
| POST   | `/api/favorites`             | Add a product to favorites (`{ productId }`) | Yes           |
| DELETE | `/api/favorites/[productId]` | Remove a product from favorites              | Yes           |

### Implementation Details

- **`app/api/favorites/route.ts`** — handles `GET` (list) and `POST` (add).
- **`app/api/favorites/[productId]/route.ts`** — handles `DELETE` (remove).
- All endpoints verify the user session via `getServerSession` from NextAuth.
- Return `401` for unauthenticated requests.
- The `POST` endpoint should be idempotent (no error if already favorited).
- Responses include the full product details (with category) so the client can render cards without extra fetches.

---

## 3. Database Helper Functions

Add favorites helpers to `lib/database.ts`, following the existing pattern:

```ts
// Favorite operations
export async function getUserFavorites(userId: string) { ... }
export async function addFavorite(userId: string, productId: string) { ... }
export async function removeFavorite(userId: string, productId: string) { ... }
export async function isFavorite(userId: string, productId: string) { ... }
```

---

## 4. Client-Side State — Favorites Context

Create `components/favorites-context.tsx`, modeled after the existing `cart-context.tsx`:

### Context Shape

```ts
interface FavoritesContextType {
  favorites: ProductWithCategory[];
  isLoading: boolean;
  addFavorite: (productId: string) => Promise<void>;
  removeFavorite: (productId: string) => Promise<void>;
  isFavorite: (productId: string) => boolean;
}
```

### Behavior

- On mount (when a user session exists), fetch `GET /api/favorites` to hydrate state.
- `addFavorite` / `removeFavorite` perform optimistic updates, calling the API in the background and rolling back on failure.
- For unauthenticated users, favorites are stored in `localStorage` as product IDs. When the user signs in, merge local favorites into the server-side set: any product IDs present in `localStorage` but not yet on the server are added via `POST /api/favorites`. Server-side favorites are always treated as the source of truth, so duplicates are skipped (the POST endpoint is idempotent). After the merge, clear the `localStorage` favorites.
- Wrap the provider in `app/layout.tsx` inside the existing `SessionProvider` and `CartProvider`.

---

## 5. UI Components

### 5.1 Favorite Toggle Button — `components/favorite-button.tsx`

- A heart icon button (using `lucide-react`'s `Heart` icon).
- Filled heart when favorited, outline when not.
- Calls `addFavorite` / `removeFavorite` from context on click.
- Shows a toast notification on toggle (using the existing toast setup).
- If the user is not signed in, prompt them to sign in (redirect or tooltip).

### 5.2 Product Card Integration

Add the `FavoriteButton` to each product card on:

- **Home page** (`app/page.tsx`) — featured products section and "Our Menu" grid.
- **Category/products pages** — if product listing pages exist or are added later.

Position the heart icon in the top-right corner of the product image, overlaying with a semi-transparent background for visibility.

### 5.3 Cart & Checkout Integration — `components/cart-sidebar.tsx`

Add a `FavoriteButton` to each item in the cart sidebar so users can favorite products while reviewing their cart or during checkout:

- Place a small heart icon next to each cart item (alongside the existing remove/quantity controls).
- The button uses the same `FavoriteButton` component and `FavoritesContext`, so toggle state stays in sync across the app.
- This lets users bookmark items they enjoy for easy reordering later, even as they complete their current purchase.
- When the cart is cleared after a successful order, favorites remain untouched since they are managed independently.

### 5.4 Favorites Page — `app/favorites/page.tsx`

A dedicated page at `/favorites` that:

- Displays all favorited products in a responsive grid (reuse the existing product card layout).
- Shows an empty state with a message and a link to browse products when no favorites exist.
- Each card has a remove-from-favorites button and an add-to-cart button.
- Requires authentication — redirect unauthenticated users to sign in.

### 5.5 Navigation Link

Add a "Favorites" link (heart icon + count badge) to the site header in `app/layout.tsx` (or a shared header component) alongside the existing cart icon. Show a badge with the number of favorited items.

---

## 6. Testing

### Unit Tests

Add tests in `__tests__/` following the existing Jest + React Testing Library setup:

- **`__tests__/favorites-context.test.tsx`** — test context provider behavior: adding, removing, checking favorites, optimistic updates, and localStorage fallback for unauthenticated users.
- **`__tests__/favorite-button.test.tsx`** — test toggle behavior, visual state (filled vs. outline heart), and sign-in prompt for unauthenticated users.

### API Route Tests

- **`__tests__/api/favorites.test.ts`** — test each API endpoint: list, add (including idempotency), remove, and 401 for unauthenticated requests.

---

## 7. Implementation Order

1. **Schema & migration** — update `prisma/schema.prisma`, run migration.
2. **Database helpers** — add functions to `lib/database.ts`.
3. **API routes** — create `app/api/favorites/` endpoints.
4. **Favorites context** — create `components/favorites-context.tsx` and wire into `app/layout.tsx`.
5. **Favorite button component** — create `components/favorite-button.tsx`.
6. **Integrate into product cards** — add favorite button to home page product cards.
7. **Integrate into cart & checkout** — add favorite button to cart items in `components/cart-sidebar.tsx`.
8. **Favorites page** — create `app/favorites/page.tsx`.
9. **Header navigation** — add favorites link/badge to the site header.
10. **Tests** — write unit and API tests.
11. **Polish** — animations, accessibility (aria labels), responsive adjustments.

---

## 8. Future Enhancements

- **Favorite counts per product** — show how many users have favorited each item (social proof).
- **Email notifications** — notify users when a favorited out-of-stock item becomes available.
- **Sort/filter by favorites** — allow sorting the product grid to show favorites first.
- **Share favorites** — generate a shareable link to a user's favorite picks.
