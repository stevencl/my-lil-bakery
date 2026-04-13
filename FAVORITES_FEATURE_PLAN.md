# Favorites Feature Plan

## Goal
Allow signed-in customers to save bakery products as favorites, quickly view them later, and manage the list from product cards and a dedicated favorites page.

## Scope
- In scope: favorites persistence, UI affordances (save/remove), favorites listing page, basic tests.
- Out of scope: social sharing, recommendations, notifications, and anonymous cross-device sync.

## Proposed Implementation

### 1) Data Model
- Add a `Favorite` Prisma model with:
  - `id` (string/cuid)
  - `userId` (relation to `User`)
  - `productId` (relation to `Product`)
  - `createdAt` (timestamp)
- Add a unique constraint on `(userId, productId)` to prevent duplicates.
- Add indexes for efficient user favorites queries.

### 2) Server/Data Access Layer
- Add favorite helper functions in `lib/`:
  - `getUserFavorites(userId)`
  - `isProductFavorited(userId, productId)`
  - `addFavorite(userId, productId)`
  - `removeFavorite(userId, productId)`
- Validate authentication and ensure users can only mutate their own favorites.
- Return safe, minimal payloads to the client.

### 3) API / Server Actions
- Implement mutation endpoints (or server actions) for add/remove favorite.
- Add robust error handling for:
  - unauthenticated users
  - missing products
  - duplicate favorites (idempotent behavior)

### 4) UI Changes
- Add a “favorite” toggle button (heart icon) to product cards.
- Show state clearly (favorited vs not favorited), including loading/disabled state while mutating.
- Add a new `/favorites` page for signed-in users:
  - grid/list of favorited products
  - empty state with CTA back to browsing
- Add link to favorites in existing navigation/profile menu.

### 5) Auth & UX Rules
- Signed-out users clicking favorite:
  - redirect to sign-in, or
  - prompt to sign in
- Preserve consistent behavior with current app auth/session patterns.

### 6) Testing Plan
- Unit tests for favorite data access methods.
- API/server-action tests for add/remove and auth checks.
- Component tests for favorite button toggle behavior.
- Page test for favorites list and empty state.

### 7) Rollout Steps
1. Update Prisma schema and run migration.
2. Implement server/data helpers.
3. Implement add/remove favorite API/server actions.
4. Add product-card toggle UI.
5. Build `/favorites` page and nav link.
6. Add/update tests.
7. Run lint, typecheck, tests, and build.

## Acceptance Criteria
- Users can favorite and unfavorite products.
- Favorites persist per user account.
- Duplicate favorites are prevented.
- Favorites page displays only the signed-in user’s favorites.
- Signed-out users are prompted to sign in before saving favorites.
