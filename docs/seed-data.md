# Seed Data

## What Is Seeded

`supabase/seed.sql` now seeds a deterministic demo dataset for local development and staging demos.

Included:

- 4 demo auth users and synced profiles
- 6 active categories
- 12 providers across multiple Slovenian regions
- provider category links
- weekly opening hours for most public providers
- provider image galleries
- offer posts in mixed states
- favorites
- analytics events
- claim requests in pending, approved, and rejected states

## Demo Scenarios Covered

- active and verified providers ready for public discovery
- active but unverified providers
- pending verification providers
- suspended providers
- providers with missing images
- providers with missing opening hours
- provider already linked to an owner
- provider with a pending claim request
- current Fresh Today and Discount offer states
- archived, expired, and draft offer records
- meaningful admin/provider analytics totals

## Reset and Reseed

Local reset:

```bash
npm run seed
```

Linked staging reset:

```bash
npm run seed:linked
```

These commands reapply migrations and then run `supabase/seed.sql`.

## Demo Accounts

- `consumer@demo.radardomace.local`
- `provider@demo.radardomace.local`
- `claimant@demo.radardomace.local`
- `admin@demo.radardomace.local`

Password:

- `DemoPass123!`

## Seed Notes

- All provider content is fake/demo content.
- Image URLs are deterministic placeholder URLs, not uploaded production assets.
- Relative offer windows use `now()` so active/expired states remain useful on every reset.
