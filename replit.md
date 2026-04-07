# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **Auth**: express-session with SESSION_SECRET env var
- **Frontend**: React + Vite + Tailwind CSS + wouter + TanStack Query

## Artifacts

### Inferno SMP Store (`artifacts/inferno-smp`)
A full-stack Minecraft server store website.

**Features:**
- Dark theme with orange/red fire gradients
- Home page with server IP copy, features section, featured ranks
- Store page with 6 rank cards (Inferno ₹2499, Storm ₹2199, Frost ₹1999, Abyss ₹1799, Toxic ₹1499, VIP ₹999)
- Auth system (register/login) — first registered user becomes admin automatically
- Checkout with UPI payment proof (transaction ID)
- User dashboard — view own orders and statuses
- Admin panel — view all orders, approve/reject

**Routes:**
- `/` — Home
- `/store` — Store
- `/dashboard` — User dashboard (auth required)
- `/admin` — Admin panel (admin role required)
- `/login` — Login
- `/register` — Register

### API Server (`artifacts/api-server`)
Express 5 REST API backing the Inferno SMP store.

**Key routes:**
- `POST /api/register` — Register (first user becomes admin)
- `POST /api/login` — Login with session
- `POST /api/logout` — Logout
- `GET /api/me` — Get current session user
- `GET /api/store` — Get all ranks
- `POST /api/buy` — Submit purchase (auth required)
- `GET /api/orders` — Get user's orders (auth required)
- `GET /api/admin/orders` — Get all orders (admin only)
- `POST /api/admin/update` — Approve/reject order (admin only)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

## Environment Variables

- `SESSION_SECRET` — Required for express-session
- `DATABASE_URL` — PostgreSQL connection string

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
