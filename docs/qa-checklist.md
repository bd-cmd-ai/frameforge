# QA Checklist

## Pre-demo smoke checks

- `npm run test` passes.
- `npm run typecheck` passes.
- `npm run build:web` is rerun in the target environment before the demo.
- `.env`, `apps/web/.env.local`, and `apps/mobile/.env` are populated from the examples.
- `supabase start` and `npm run seed` complete successfully.

## Post-seed validation

- Consumer, provider, claimant, and admin demo accounts can sign in with `DemoPass123!`.
- At least 12 seeded providers are visible in the database.
- Seeded claim requests appear in the admin claims view.
- Seeded offer posts appear in provider and admin offer views.
- Seeded favorites and analytics counters are non-zero.

## Auth and role routing

- Consumer can sign in and sign out.
- Consumer can create a new account.
- Provider account lands in the provider portal.
- Admin account lands in the admin dashboard.
- Unauthorized role access redirects to `/unauthorized`.

## Consumer mobile flow

- Explore requests foreground location.
- Denied permission state is actionable.
- Nearby providers load after permission is granted.
- Filter modal updates results correctly.
- Empty state appears when filters are too narrow.
- Provider detail loads and shows safe fallbacks for missing content.
- Favorite add/remove works.
- Favorites screen updates after toggling.
- Navigate button opens a maps route.
- Call and website CTA work when data exists.

## Provider portal flow

- Provider without ownership sees claim flow entry point.
- Pending claim state is visible.
- Owned provider sees dashboard, checklist, offers, and analytics summary.
- Profile form validates and saves.
- Category selection saves.
- Opening hours validate sensible times.
- Image upload rejects invalid file types or sizes.
- Offer create and update actions show success/error feedback.

## Admin flow

- Dashboard summary cards render.
- Providers list filters by name, city, status, and verified state.
- Provider detail shows moderation state and related claims.
- Claim approve/reject works and refreshes the page.
- Offer moderation activate/archive works.
- Categories can be created and updated.
- Analytics page shows seeded totals and leaderboards.

## Seeded analytics visibility

- Provider dashboard has non-zero values for at least one seeded provider.
- Admin analytics page has non-zero totals.
- Top viewed and top navigated provider blocks are populated.

## Manual regression notes

- If a query fails, the screen should show a readable empty or error state rather than crashing.
- Missing provider images, hours, or descriptions should not break cards or detail pages.
- Mutations should show clear success or failure feedback.
- If dependencies were reinstalled, rerun `npm install` before repeating the checks above.
