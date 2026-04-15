# Sweet Dreams Bakery Platform

[![CI](https://github.com/digitarald/my-lil-bakery/actions/workflows/ci.yml/badge.svg)](https://github.com/digitarald/my-lil-bakery/actions/workflows/ci.yml)

Our online bakery platform - built for Sweet Dreams Bakery team.

## Quick Start

```bash
# Install dependencies
pnpm install

# Copy environment variables template
cp .env.example .env

# Setup database & seed with our products
pnpm db:migrate && pnpm db:seed

# Start development
pnpm dev
```

Visit `http://localhost:3000` - you're ready to go!

## Daily Commands

```bash
pnpm dev          # Start development server
pnpm test         # Run tests
pnpm db:studio    # View database in browser
pnpm db:seed      # Reset to sample data
```

## What's Built

- **Customer storefront** - Browse our 4 categories (Cakes, Pastries, Bread, Cookies)
- **Shopping cart** - Add items, checkout
- **User accounts** - Customer signup/login
- **Admin dashboard** - Manage products and orders at `/admin`
- **Order system** - Track customer orders

## App Routes (Current)

### UI routes

- `/` - Customer storefront (hero, featured products, full catalog, filters, cart sidebar)
- `/admin` - Admin dashboard (product CRUD + order status management, admin-only)
- `/checkout/success` - Post-checkout success/confirmation page
- `/auth/signin` - Sign in (Google, email magic link, credentials)
- `/auth/signup` - Sign up form
- `/auth/auth-code-error` - Authentication error fallback page

### API routes

- `GET /api/products` - List products with categories
- `GET /api/categories` - List categories (+ in-stock product counts)
- `GET /api/orders` - List all orders (used by admin dashboard)
- `POST /api/orders/create` - Create order with items
- `PATCH /api/orders/:id` - Update order status
- `GET /api/admin/products` - List all products (admin dashboard)
- `POST|PUT|DELETE /api/admin/products/manage` - Create/update/delete product
- `GET /api/admin/stats` - Aggregate order statistics
- `POST /api/auth/signup` - Create account
- `GET|POST /api/auth/[...nextauth]` - NextAuth handlers

## Exploring a Favourites Feature

There is no favourites model yet, so this is a clean addition path.

### Recommended approach (server-backed, logged-in users)

1. **Data model (Prisma)**
   - Add `Favorite` model:
     - `id`, `userId`, `productId`, `createdAt`
     - Unique constraint on `[userId, productId]`
   - Add relations on `User` and `Product`.
2. **API routes**
   - `GET /api/favorites` -> current user's favorite products
   - `POST /api/favorites` -> add product to favorites
   - `DELETE /api/favorites/:productId` -> remove favorite
3. **UI changes**
   - Add a heart toggle on product cards in `/`.
   - If not signed in, clicking heart should prompt sign-in.
   - Optional: add `?favorites=1` filter in product list.
4. **State strategy**
   - Load favorites once after session load and cache in client state/context.
   - Optimistically update heart toggle, then reconcile with API response.
5. **Security/permissions**
   - Require authenticated session in favorites API routes.
   - Always scope read/write/delete to session user only.

### Lightweight alternative (no DB migration)

- Store favorites in `localStorage` for anonymous + logged-out users first.
- Later migrate to server-backed favorites and sync on login.
- This is fastest to ship but does not persist across devices.

## Tech We're Using

- Next.js 15 (App Router)
- Prisma (SQLite for dev)
- NextAuth.js (authentication)
- Tailwind CSS + Radix UI
- TypeScript

## Test Data

When you seed, you get:
- 10 sample bakery products across our categories
- Test admin account: `admin@sweetdreamsbakery.com`

Note: demo admin has no seeded password; the dev-only `test.admin@localhost.dev` gets a password only when `NODE_ENV !== 'production'` (override with `SEED_ADMIN_PASSWORD`).

## Project Layout

```
app/           # Pages (homepage, admin, auth)
components/    # Reusable UI components  
lib/           # Database & utility functions
prisma/        # Database schema & seed data
__tests__/     # Test files
```

## Continuous Integration

Our CI pipeline automatically runs on every push to main and pull requests:

- **Code Quality**: ESLint linting and TypeScript type checking
- **Testing**: Full Jest test suite with database setup
- **Build**: Next.js production build validation
- **Security**: Dependency vulnerability scanning

The workflow uses Node.js 22 LTS and pnpm for package management.

## Need Help?

- Database issues? Run `pnpm db:migrate`
- Want fresh data? Run `pnpm db:seed`
- Tests failing? Check `pnpm test`
