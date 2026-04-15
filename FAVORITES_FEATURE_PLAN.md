# Favorites Feature Plan

## Goal
Allow signed-in users to mark bakery products as favorites, view those saved items later, and remove favorites when desired.

## Scope (MVP)
- Add a **favorite/unfavorite toggle** on product cards.
- Persist favorites per user in the database.
- Expose a way to **list a user’s favorites** (section or page).
- Keep favorites independent from cart behavior.

## Execution Plan

### 1) Data Model
- Add a `Favorite` model in Prisma linking `User` and `Product`.
- Enforce one favorite per user/product pair with a unique constraint.
- Run migration and regenerate Prisma client.

### 2) Backend APIs
- Create protected endpoints/actions to:
  - add favorite
  - remove favorite
  - list current user favorites
- Validate authentication and product existence.
- Return stable, typed responses for UI updates.

### 3) UI Integration
- Add a heart icon button on each product card.
- Show correct state (favorited vs not favorited).
- Optimistically update UI and reconcile with server response.
- Add a “My Favorites” view/section to quickly access saved items.

### 4) Testing
- Add unit/integration tests for:
  - favorite creation/removal rules
  - duplicate favorite prevention
  - auth-protected access
  - favorite toggle rendering/state transitions

### 5) Rollout & Validation
- Validate lint, typecheck, tests, and build.
- Manually verify key flows:
  - favorite add/remove
  - favorites persist across refresh/login
  - non-auth users are prompted to sign in

## Risks & Mitigations
- **Duplicate favorites** → unique DB constraint + API guard.
- **UI/server state mismatch** → optimistic update with rollback on error.
- **Unauthorized access** → enforce server-side auth checks on all favorite operations.

## Definition of Done
- Users can add/remove favorites reliably.
- Favorites are persisted and reload correctly for each user.
- Tests cover core favorite logic and UI behavior.
- No regression in existing cart/product flows.
