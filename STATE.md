# STATE

Rule: Replace content on every update. Never append history here. Max 60 lines.
History lives in `docs/DECISIONS.md` (decisions) and `docs/BACKLOG.md` (tasks).

---

Status: Playable v1 (local + online). Online multiplayer added: server-authoritative on Vercel Functions + Supabase, per-player redacted views. Build clean; 47 tests green; `api/` type-checks.
Current_Goal: Align Supabase env names with coinchapp, then verify online play end-to-end on two devices.
Next_Actions:
- User: run `supabase/migrations/0001_init.sql` on the Supabase project; enable Anonymous auth; set the 3 env vars in Vercel.
- Test online flow on two devices (create/join via 3-char code, turn handoff, win/lose, restart).
- IMPORTANT: rotate the service_role key (it was pasted into chat) after testing.
- Raise traffic gradually and re-confirm winnability; tune `createYulApproach()`.

Open_Questions:
- Exact YUL approach-track traffic distribution (v1 = gentle approximation in `src/game/config.ts`).
- Final-round simultaneous-arrival handling is a pragmatic interpretation (see DECISIONS).
- Online disconnect/reconnect handling not implemented yet (BACKLOG/Next).

Recent_Changes:
- 2026-06-13 Aligned Supabase env names with `coinchapp`: browser now uses `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY`, Vite accepts `NEXT_PUBLIC_*`, server reuses `NEXT_PUBLIC_SUPABASE_URL`, and setup docs now expect 3 Vercel vars instead of 4.
- 2026-06-12 Added online multiplayer: home screen (local/online), lobby (nickname, create/join, 3-char room code), waiting room. Server-authoritative engine in `api/` (create/join/start/view/move) + Supabase (anon auth, RLS, `game_events` realtime ticks, pg_cron cleanup). Redacted per-player views (`src/game/redact.ts`). Local pass-and-play unchanged. Build clean; 47 tests green; `npx tsc -p api` clean.
- 2026-06-08 Added i18n (EN default + FR) with a splash-screen language switcher (persisted in localStorage). Engine emits locale-neutral codes; UI translates via `src/i18n`.
- 2026-06-08 Reskinned UI to match the physical board: brushed-steel cockpit, color-coded action tiles, attitude indicator, metallic tracks, themed speed gauge, boarding-pass role cards (presentational only).
- 2026-06-08 Fixed handoff privacy leak: dice tray hidden during pass-and-play handoff; handoff screen is a fully opaque viewport cover.
