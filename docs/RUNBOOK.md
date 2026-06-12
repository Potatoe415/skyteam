# RUNBOOK

Status: Active.
Load this file only if the task contains or implies: run / command / script / setup / start / test / check / lint / build / deploy / migrate / seed / install.

NOTE: The Cursor agent terminal is blocked by an unsupported sandbox policy on this
Windows machine. Run these commands in your OWN integrated terminal (not via the agent).

---

## Setup
```powershell
npm install
copy .env.example .env   # then fill in your Supabase values
```

## Environment variables (online multiplayer)
Set these in `.env` locally and in the Vercel project settings:
- `VITE_SUPABASE_URL` — Supabase project URL (exposed to the browser).
- `VITE_SUPABASE_ANON_KEY` — anon/publishable key (exposed to the browser).
- `SUPABASE_URL` — same project URL, used by `api/` functions.
- `SUPABASE_SERVICE_ROLE_KEY` — service_role secret. SERVER ONLY. Never expose; never commit.
Also enable Anonymous sign-in in Supabase (Auth → Providers → Anonymous).

## Database (online multiplayer)
Run the schema once against your Supabase project (re-runnable):
```
supabase/migrations/0001_init.sql
```
Apply it via the Supabase SQL editor (paste + run) or the Supabase CLI. It creates
the 3 game tables, RLS, the `game_events` realtime publication, and the cleanup cron.

## Development
```powershell
npm run dev
```
Then open the printed URL (default http://localhost:5173). Use browser devtools
device toolbar (mobile viewport) to test the mobile-first layout. The `/api`
functions only run on Vercel; use `npx vercel dev` to exercise online mode locally.

## Test
```powershell
npm test          # run engine unit tests once
npm run test:watch
```

## Build
```powershell
npm run build     # type-check + production build to dist/
npm run preview   # preview the production build locally
npx tsc -p api    # type-check the server functions (not covered by npm run build)
```

## Deploy
Static site. Any static host works. Vercel:
```powershell
npx vercel deploy
```
Build command: `npm run build` ; output dir: `dist`.

## Troubleshooting
- "Sandbox policy not supported" when the AGENT runs commands: expected on Windows;
  run commands yourself in the integrated terminal instead.
- Port in use: `npm run dev -- --port 5174`.
- Type errors on build: run `npm run build` to see them; engine logic is covered by `npm test`.
