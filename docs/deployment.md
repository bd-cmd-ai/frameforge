# Deployment Notes

## Staging Checklist

### Supabase

- create the Supabase project
- enable email/password auth
- run all migrations
- verify PostGIS extension is available
- create or confirm the `provider-images` public bucket
- set auth redirect URLs for web and Expo as needed
- run the seed only in demo/staging environments

### Environment Variables

Web:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
- `NEXT_PUBLIC_PROVIDER_IMAGES_BUCKET`
- `SUPABASE_SERVICE_ROLE_KEY` if server-side admin tasks need it later

Mobile:

- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY`
- `EXPO_PUBLIC_PROVIDER_IMAGES_BUCKET`
- `EXPO_PUBLIC_WEB_URL`
- `EXPO_PUBLIC_APP_SCHEME`

## Web Deploy Notes

- deploy the Next.js app to a Node-compatible host such as Vercel
- ensure middleware runs in the chosen hosting environment
- confirm the app URL matches Supabase auth redirect settings
- verify admin and provider routes are protected after deployment

## Mobile Build Notes

- Expo development uses `npm run dev:mobile`
- static export check uses `npm run build:mobile`
- production mobile delivery should use EAS Build/App Store/Play Store workflows
- confirm the mobile scheme and Supabase redirect settings are aligned before release

## Post-Deploy Smoke Tests

1. Sign in as each seeded role and confirm redirects
2. Verify consumer Explore loads map/list results
3. Open at least one provider detail and start navigation
4. Save and remove a favorite
5. Sign in as provider and edit profile content
6. Upload or reorder at least one provider image
7. Create and archive an offer
8. Sign in as admin and review claims/offers/providers
9. Confirm admin analytics summary shows seeded data

## Known Manual Steps

- real map API quotas and restrictions still need environment-level setup
- real production image assets are not part of the demo seed
- staging reset commands should not be used against production environments
