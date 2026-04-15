# Radar Domače

Radar Domače is a production-shaped MVP for discovering nearby local food producers while traveling, with a provider portal and an admin moderation workspace on top of Supabase.

## Product Surfaces

- Consumer mobile app: Expo + React Native
- Provider portal: Next.js App Router
- Admin dashboard: Next.js App Router
- Shared backend layer: Supabase + PostgreSQL/PostGIS + Supabase Auth + Storage

## Tech Stack

- Mobile: Expo, Expo Router, React Native, react-native-maps
- Web: Next.js 15, React 19, TypeScript
- Backend: Supabase
- Database: PostgreSQL + PostGIS
- Auth: Supabase Auth
- Storage: Supabase Storage
- Validation: Zod

## Workspace Overview

```txt
apps/
  mobile/                  Expo consumer app
  web/                     Next.js provider portal + admin
packages/
  analytics/               lightweight analytics adapter
  api/                     typed auth/query/mutation layer
  config/                  app config and theme tokens
  types/                   shared domain and database types
supabase/
  migrations/              schema, policies, SQL helpers
  seed.sql                 deterministic demo seed
docs/
  architecture.md          high-level system map
  demo-script.md           presenter-ready 5-7 minute demo flow
  seed-data.md             demo data and reseeding notes
  deployment.md            staging deployment checklist
  qa-checklist.md          manual smoke-test checklist
  known-issues.md          current technical caveats and MVP limits
tests/
  *.test.mjs               smoke checks for seed/env/docs readiness
```

## MVP Scope

Implemented:

- Consumer auth and role-aware session handling
- Explore map/list discovery flow
- Filters, provider detail, favorites, navigation CTA
- Provider login, claim flow, profile management, categories, images, opening hours, offers, analytics summary
- Admin dashboard, provider moderation, claims review, offer moderation, categories, analytics summary
- Supabase schema, RLS, helper SQL functions, PostGIS discovery
- Deterministic demo seed for local/staging demos

Intentionally not included:

- payments
- checkout
- delivery
- chat
- partner regions
- background radar behavior

## Local Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Copy the examples you need:

```bash
cp .env.example .env
cp apps/web/.env.example apps/web/.env.local
cp apps/mobile/.env.example apps/mobile/.env
```

Minimum required variables:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`

Recommended staging/demo variables:

- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
- `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY`
- `NEXT_PUBLIC_PROVIDER_IMAGES_BUCKET`
- `EXPO_PUBLIC_PROVIDER_IMAGES_BUCKET`
- `NEXT_PUBLIC_APP_URL`
- `EXPO_PUBLIC_WEB_URL`
- `EXPO_PUBLIC_APP_SCHEME`

### 3. Start and reset Supabase

```bash
supabase start
npm run seed
```

This applies all migrations and the deterministic demo seed in `supabase/seed.sql`.

### 4. Run the web app

```bash
npm run dev:web
```

Open [http://localhost:3000](http://localhost:3000).

### 5. Run the mobile app

```bash
npm run dev:mobile
```

Open the Expo project in a simulator or Expo Go.

## Demo Accounts

Seeded demo auth users:

- Consumer: `consumer@demo.radardomace.local`
- Provider: `provider@demo.radardomace.local`
- Provider claimant: `claimant@demo.radardomace.local`
- Admin: `admin@demo.radardomace.local`

Password for all seeded demo users:

- `DemoPass123!`

## Useful Commands

```bash
npm run dev
npm run dev:web
npm run dev:mobile
npm run build
npm run build:web
npm run build:mobile
npm run typecheck
npm run test
npm run seed
npm run seed:linked
npm run db:types
```

## Database and Seed Notes

- Public provider discovery is driven by SQL helper views/functions, not ad hoc client-side filtering.
- `search_providers(...)` is the main nearby-discovery RPC.
- The seed contains:
  - categories
  - 12 demo providers
  - provider ownership scenarios
  - claim requests
  - offers in multiple states
  - favorites
  - analytics events

More detail: [docs/seed-data.md](docs/seed-data.md)

## Running Quality Checks

Lightweight repo checks:

```bash
npm run test
```

These smoke tests verify that the seed and env examples remain aligned with the documented MVP setup.

Manual QA checklist:

- [docs/qa-checklist.md](docs/qa-checklist.md)

Demo walkthrough:

- [docs/demo-script.md](docs/demo-script.md)

## Deployment Overview

Staging deployment notes and checklists live in:

- [docs/deployment.md](docs/deployment.md)
- [docs/known-issues.md](docs/known-issues.md)

## Known MVP Limitations

- No payments or billing flows
- No checkout or marketplace ordering
- No delivery logic
- No partner-region module yet
- No background always-on radar behavior
- Analytics are operational, not product-intelligence depth
- Provider verification is still a manual moderation workflow
