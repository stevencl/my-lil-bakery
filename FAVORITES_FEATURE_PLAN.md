# Favorites Feature Plan

This document describes the plan for adding a **Favorites** (wishlist) feature to the Sweet Dreams Bakery app, allowing authenticated users to save products they love for quick access later.

---

## 1. Database Schema Changes

### New `Favorite` model in `prisma/schema.prisma`

Add a join table linking users to products:

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

Add reverse relations to the existing models:

- **User model** — add `favorites Favorite[]`
- **Product model** — add `favorites Favorite[]`

Run `npx prisma migrate dev --name add-favorites` to generate and apply the migration.

---

## 2. Database Helper Functions

Add the following functions to `lib/database.ts`:

| Function | Description |
|---|---|
| `getUserFavorites(userId)` | Return all favorites for a user, including the related product and its category. |
| `addFavorite(userId, productId)` | Create a new favorite (upsert-safe with the unique constraint). |
| `removeFavorite(userId, productId)` | Delete a favorite by the `userId + productId` composite key. |
| `isFavorite(userId, productId)` | Return a boolean indicating whether the product is already favorited. |

---

## 3. API Routes

Create a new route group under `app/api/favorites/`:

### `GET /api/favorites`
- **Auth:** Requires an authenticated session (use `getServerSession` from NextAuth).
- **Response:** Returns the array of favorited products for the current user.

### `POST /api/favorites`
- **Auth:** Requires an authenticated session.
- **Body:** `{ productId: string }`
- **Behavior:** Adds the product to the user's favorites. Returns `201` on success.
- **Error:** Returns `409` if already favorited, `400` if `productId` is missing.

### `DELETE /api/favorites`
- **Auth:** Requires an authenticated session.
- **Body / Query:** `{ productId: string }`
- **Behavior:** Removes the product from the user's favorites. Returns `200` on success.

All three endpoints should return `401` for unauthenticated requests.

---

## 4. Client-Side State Management

### New `FavoritesContext` (`components/favorites-context.tsx`)

Follow the same pattern used by `CartContext` (React Context + Provider):

```
FavoritesProvider
├── state: favoriteIds (Set<string>), loading (boolean)
├── actions: toggleFavorite(productId), isFavorite(productId)
└── on mount: fetch GET /api/favorites if session exists
```

Key behaviors:
- **Authenticated users** — favorites are persisted to the database via the API routes.
- **Unauthenticated users** — the favorite button is hidden or prompts sign-in (no localStorage fallback needed, since favorites are a personalized feature).
- Optimistic UI updates — toggle the local state immediately, then call the API. Roll back on failure.

### Wire into the app

Wrap the app with `<FavoritesProvider>` inside `app/layout.tsx`, nested inside `<SessionProvider>` (it depends on the session).

---

## 5. UI Changes

### 5a. Favorite Toggle Button on Product Cards

On each product card in `app/page.tsx` (both the Featured section and the All Products grid):

- Add a **heart icon button** (use `Heart` from `lucide-react`, which is already installed).
- Filled/red heart = favorited; outlined heart = not favorited.
- Position the button at the top-right corner of the product image, overlaying the card (similar to the existing Pre-Order / Out of Stock badges).
- Clicking the heart calls `toggleFavorite(product.id)` from the context.
- Only visible when the user is signed in (`useSession`).

### 5b. "My Favorites" Filter / View

Add a **"Favorites" filter toggle** to the products section toolbar (alongside the existing search, category, and sort controls):

- A toggle button or chip labeled "♥ Favorites" that, when active, filters the product grid to only show favorited items.
- Disabled or hidden when the user is not signed in.

### 5c. Favorites Page

Add a dedicated `/favorites` page accessible from the site navigation:

- Shows all favorited products in a grid, with the ability to remove favorites and add items to cart.
- Includes an empty state message such as *"You haven't favorited anything yet — browse our products to find something you love!"*

---

## 6. Testing

### Unit Tests

Add tests following the existing patterns in `__tests__/`:

| Test File | Coverage |
|---|---|
| `__tests__/favorites-context.test.tsx` | Test the `FavoritesProvider`: toggling, initial fetch, optimistic rollback. Mock `fetch` and `useSession`. |
| `__tests__/favorites-api.test.ts` | Test the API route handlers: auth checks, add/remove/list operations, error cases. |

### Manual Testing Checklist

- [ ] Unauthenticated user does not see the heart icon.
- [ ] Authenticated user can click the heart to favorite a product; heart fills in.
- [ ] Clicking a filled heart removes the favorite; heart becomes outlined.
- [ ] Refreshing the page preserves favorites (fetched from DB).
- [ ] Filtering by favorites shows only favorited products.
- [ ] Adding a favorited product to the cart works as expected.
- [ ] Deleting a product from the admin panel cascades and removes related favorites.

---

## 7. Implementation Order

1. **Schema & migration** — Add the `Favorite` model and run the migration.
2. **Database helpers** — Implement `getUserFavorites`, `addFavorite`, `removeFavorite`, `isFavorite` in `lib/database.ts`.
3. **API routes** — Create `GET`, `POST`, `DELETE` handlers in `app/api/favorites/route.ts`.
4. **FavoritesContext** — Build the React context, provider, and `useFavorites` hook.
5. **UI: heart button** — Add the favorite toggle to product cards in `app/page.tsx`.
6. **UI: favorites filter** — Add the favorites filter toggle to the product toolbar.
7. **Tests** — Write unit tests for the context and API routes.
8. **Polish** — Loading states, toast notifications (using the existing `Toaster`/`sonner` setup), accessibility (`aria-label` on the heart button), and responsive design review.

---

## 8. Dependencies

No new dependencies are required. The feature uses:

- **Prisma** (already installed) for database operations
- **NextAuth** (already installed) for authentication checks
- **lucide-react** (already installed) for the `Heart` icon
- **shadcn/ui** (already installed) for `Button` and `Badge` components
- **sonner** (already installed) for toast notifications
