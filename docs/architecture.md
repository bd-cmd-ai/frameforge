# Radar Domače Architecture

## High-Level Structure

```txt
apps/mobile
  Consumer-facing Expo app
  Explore flow, provider detail, favorites, auth/session state

apps/web
  Next.js app with:
  - provider routes
  - admin routes
  - auth entry points

packages/api
  Typed auth helpers
  Typed queries/mutations
  Admin/provider/mobile-facing data access

packages/types
  Shared domain entities
  Generated database snapshot types

packages/config
  App config defaults and shared tokens

packages/analytics
  Lightweight analytics adapter abstraction

supabase
  SQL migrations
  helper functions/views
  RLS policies
  deterministic demo seed
```

## Auth and Role Model

Roles are stored in `public.profiles.role` and drive both routing and RLS:

- `consumer`
- `provider`
- `admin`

Flow summary:

1. Supabase Auth creates or updates an `auth.users` row
2. SQL triggers sync that identity into `public.profiles`
3. Web/mobile resolve the current profile after session restoration
4. Route guards redirect based on the profile role
5. RLS remains the final authorization boundary

## Data Flow Summary

### Mobile

- Expo restores the session through `expo-secure-store`
- hooks call the shared `@radar-domace/api` layer
- discovery is powered by `search_providers(...)`
- provider detail, favorites, and CTA actions feed `analytics_events`

### Provider Portal

- Next.js server components resolve auth on the server
- provider pages load the managed provider and related rows through shared queries
- client-side forms call typed mutations and then refresh the route

### Admin

- admin routes are server-protected
- summary pages read aggregated operational data from shared queries
- moderation actions update providers, claims, categories, and offers through typed mutations

## Maps and Data Sourcing

Nearby provider queries use PostGIS:

- `providers.location` stores the authoritative geography point
- `providers_sync_location` keeps it aligned with latitude/longitude
- `providers_location_idx` supports radius search
- `search_providers(...)` applies:
  - radius filter
  - category filter
  - open-now filter
  - verified filter
  - fresh-today filter
  - ordering by distance, open status, verified, fresh, promoted

The current MVP uses Google Maps-style navigation deep links from mobile, while web/admin focus on moderation and management rather than map rendering.

## Folder Conventions

### Mobile

- `app/` for Expo Router entry points
- `src/hooks/` for location/auth/discovery state
- `src/components/explore/` for discovery UI
- `src/components/provider/` for provider-specific UI
- `src/lib/` for formatting, deep links, env, and supporting utilities

### Web

- `src/app/(portal)` for provider routes
- `src/app/admin` for admin routes
- `src/components/provider-portal/` for provider workspace UI
- `src/components/admin/` for admin workspace UI
- `src/lib/` for auth, env, uploads, validation, and formatting

## Major SQL Helpers

- `provider_meets_public_requirements`
- `provider_is_public`
- `provider_is_open_now`
- `provider_has_active_offer`
- `provider_is_currently_promoted`
- `provider_public_cards`
- `provider_public_profiles`
- `search_providers(...)`

## Scaling Notes

The current structure is intentionally ready for:

- richer analytics
- Stripe-backed monetization later
- stronger moderation workflows
- additional provider team/account relationships
- better content localization tooling
- future regional segmentation without rewriting the core domain model
