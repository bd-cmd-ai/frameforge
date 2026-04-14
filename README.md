# FrameForge Production OS

FrameForge is now a real self-contained full-stack film production app:

- Node HTTP backend with authenticated JSON API
- disk-persisted JSON database in [data/production-db.json](/Users/bojch/Documents/CODEX/data/production-db.json)
- Google sign-in support for invited team emails
- login flow with demo accounts
- team directory with user creation and permission assignment
- editable project profile
- shooting schedule / stripboard CRUD
- scene breakdown CRUD
- call sheet view generated from live data
- crew and vendor contacts CRUD
- task tracking CRUD + kanban view
- budget tracking CRUD
- assets / production docs CRUD
- export + reset controls

## Demo login

- `producer@frameforge.app` / `demo123`
- `ad@frameforge.app` / `demo123`
- `viewer@frameforge.app` / `demo123`

Google login also works once you configure `GOOGLE_CLIENT_ID` and the Google account email matches a user in `Team & Access`.

## Run

```bash
npm start
```

Then open:

- [http://127.0.0.1:4173](http://127.0.0.1:4173)

## Google Auth Setup

1. Copy `.env.example` to `.env`
2. Set `GOOGLE_CLIENT_ID` to your Google OAuth Web Client ID
3. In Google Cloud Console, add your local/dev origin, for example:
   - `http://127.0.0.1:4173`
4. Start the app with `npm start`
5. Add team members in `Team & Access` using the same email address as their Google account

The backend verifies the Google ID token and only allows login when the email already exists on the project team.

## GitHub Ready

I also prepared the project for a GitHub-hosted workflow:

- `.gitignore` ignores local secrets like `.env`
- `.env.example` documents required runtime config
- the app is now closer to something you can push and deploy instead of a purely local prototype

What I did not do automatically:

- create a GitHub repo
- push the code
- set GitHub Actions / deployment

If you want, the next step can be a deployment pass for Render, Railway, Fly.io, or a Vercel-style split setup.

## Notes

- No external runtime dependencies are required.
- Data persists between runs because writes go to [data/production-db.json](/Users/bojch/Documents/CODEX/data/production-db.json).
- `Reset demo data` restores the seeded production database.
- Producers/admins have full access by default; viewers and team members can be assigned module-by-module view/edit rights from the `Team & Access` screen.
- Permissions now support `no access`, `view`, and `edit`.
