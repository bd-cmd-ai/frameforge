# FrameForge

FrameForge has been hard-reset onto a clean baseline.

This new foundation keeps the existing local/Google auth direction and Render-friendly setup, but replaces the old patched app with a simpler stack:

- clean Node HTTP server
- JSON persistence with local runtime DB
- Google sign-in support via `GOOGLE_CLIENT_ID`
- global settings
- project settings + weather sync
- multiple call sheets by shoot day
- document upload + PDF/image preview
- team access with module permissions

## Local run

```bash
npm start
```

App URL:

```txt
http://127.0.0.1:4173
```

Local producer login:

```txt
producer@frameforge.app
demo123
```

## Environment

Copy `.env.example` to `.env` and fill in values as needed.

```env
HOST=127.0.0.1
PORT=4173
GOOGLE_CLIENT_ID=your-google-oauth-client-id.apps.googleusercontent.com
BOOTSTRAP_ADMIN_EMAILS=owner@example.com
DATA_FILE=/absolute/path/to/data/production-db.local.json
SEED_FILE=/absolute/path/to/data/production-db.json
```

## Notes

- `data/production-db.json` is the tracked seed
- `data/production-db.local.json` is the runtime database and stays out of git
- uploaded documents are stored under `uploads/assets`
- weather sync uses Open-Meteo and degrades gracefully if the provider rate-limits requests
