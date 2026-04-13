# Favorites Feature Plan

## Overview

Add a favorites (wishlist) feature that lets users save products they love for easy access later. Authenticated users will have their favorites persisted in the database; unauthenticated users will have favorites stored in `localStorage` so they still get a useful experience without signing in.

---

## 1. Database Changes

### New Prisma model – `Favorite`

Add a join table between `User` and `Product` in `prisma/schema.prisma`:

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

Update the existing `User` and `Product` models to include the reverse relation:

```prisma
model User {
  ...
  favorites Favorite[]
}

model Product {
  ...
  favorites Favorite[]
}
```

Run `npx prisma migrate dev --name add-favorites` to generate and apply the migration.

---

## 2. API Routes

Create a new set of API routes under `app/api/favorites/`:

| Method | Route | Description |
|--------|-------|-------------|
| `GET` | `/api/favorites` | Return the current user's favorite product IDs |
| `POST` | `/api/favorites` | Add a product to favorites (`{ productId }`) |
| `DELETE` | `/api/favorites` | Remove a product from favorites (`{ productId }`) |

All routes require authentication (use `getServerSession` from NextAuth). Return `401` for unauthenticated requests.

### File: `app/api/favorites/route.ts`

- **GET**: Query `prisma.favorite.findMany({ where: { userId } })` and return the list of favorite product IDs (and optionally full product data).
- **POST**: Use `prisma.favorite.create()` with the `userId` and `productId`. Handle duplicate gracefully (return existing entry).
- **DELETE**: Use `prisma.favorite.delete()` with the composite unique key `[userId, productId]`.

---

## 3. Client-Side State – `FavoritesContext`

Create `components/favorites-context.tsx`, following the same pattern as the existing `components/cart-context.tsx`:

### Interface

```ts
interface FavoritesContextType {
  favoriteIds: string[]              // list of product IDs
  addFavorite: (productId: string) => void
  removeFavorite: (productId: string) => void
  toggleFavorite: (productId: string) => void
  isFavorite: (productId: string) => boolean
  isLoading: boolean
}
```

### Behavior

| Scenario | Storage | Sync |
|----------|---------|------|
| **Authenticated user** | Database via API routes | Fetch on mount; optimistic UI updates with API calls |
| **Unauthenticated user** | `localStorage` key `"favorites"` | Read/write on every change |

On sign-in, merge any `localStorage` favorites into the database and clear `localStorage`.

### Provider

Wrap the app with `<FavoritesProvider>` in `app/layout.tsx`, inside the existing `<CartProvider>` and `<SessionProvider>`.

---

## 4. UI Components

### 4a. Favorite Toggle Button – `components/favorite-button.tsx`

A heart icon button that toggles a product's favorite status.

- **Unfavorited state**: outlined heart (`<Heart />` from `lucide-react`)
- **Favorited state**: filled heart (`<Heart className="fill-current text-red-500" />`)
- Calls `toggleFavorite(productId)` from context on click.
- Shows a brief toast notification on add/remove (`sonner` already used in the project).

### 4b. Product Cards on Home Page – `app/page.tsx`

Add the `<FavoriteButton>` to each product card (both the featured-products section and the all-products grid). Position it in the top-right corner of the card image.

### 4c. Favorites Page – `app/favorites/page.tsx`

A dedicated page listing all favorited products:

- Header navigation link: add a "Favorites" link (with a heart icon) to the navbar in `app/page.tsx` (where the navigation is currently defined).
- Display favorited products in a grid similar to the products section on the home page.
- Each card includes an "Add to Cart" button and a "Remove from Favorites" button.
- Empty state: friendly message with a link back to the shop (e.g., "You haven't saved any favorites yet! Browse our products.").

---

## 5. Integration with Authentication

- In the NextAuth `session` callback (`lib/auth.ts`), no changes are needed—the user ID is already available via `session.user.id`.
- When a user signs in, the `FavoritesContext` should:
  1. Read any product IDs from `localStorage`.
  2. POST each to `/api/favorites` to persist them.
  3. Clear `localStorage` favorites.
  4. Fetch the full set from the API.

---

## 6. Tests

Follow the existing Jest + React Testing Library setup:

| Test file | What to test |
|-----------|-------------|
| `__tests__/favorites-context.test.tsx` | Context provides correct default values; `addFavorite`, `removeFavorite`, `toggleFavorite`, and `isFavorite` work correctly; localStorage fallback for unauthenticated users |
| `__tests__/favorite-button.test.tsx` | Renders outlined heart when not favorited; renders filled heart when favorited; calls `toggleFavorite` on click |
| `__tests__/favorites-page.test.tsx` | Renders favorited products; shows empty state when no favorites |
| `__tests__/api/favorites.test.ts` | GET/POST/DELETE return correct status codes; unauthenticated requests return 401 |

---

## 7. Implementation Order

1. **Schema & migration** – Add `Favorite` model, generate migration, update Prisma client.
2. **API routes** – Implement `GET`, `POST`, `DELETE` under `/api/favorites`.
3. **FavoritesContext** – Create context with localStorage fallback and API sync.
4. **FavoriteButton component** – Heart toggle icon.
5. **Home page integration** – Add `<FavoriteButton>` to product cards.
6. **Favorites page** – Build `/favorites` page and add nav link.
7. **Auth merge logic** – Merge localStorage favorites on sign-in.
8. **Tests** – Unit and integration tests for all new code.
9. **Manual QA** – Verify end-to-end flow for signed-in and signed-out users.

---

## 8. Future Enhancements (Out of Scope)

- **Favorites count in header badge** – show a small count next to the heart icon in the navbar.
- **Share favorites** – generate a shareable link for a user's favorites list.
- **"Most favorited" badge** – surface popular products based on aggregate favorite counts.
- **Email reminders** – notify users when a favorited out-of-stock item is back in stock.
