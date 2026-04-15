# Known Issues

## Current technical issues

- `npm run build:web` still fails in this environment during Next.js prerender fallback generation for `/404`.
- Next.js also attempts to patch missing SWC lockfile metadata and cannot reach `registry.npmjs.org` from this restricted environment, so build output includes repeated fetch warnings.
- Because of the build issue above, final staging validation should include one more clean `npm install` and `npm run build:web` check in the target environment with network access.

## MVP limitations

- No payments or billing flows.
- No checkout or ordering flow.
- No delivery logic.
- No partner-region module yet.
- No background always-on radar behavior.
- Analytics are MVP-level operational summaries rather than deep BI reporting.
- Provider verification remains a manual moderation workflow.
