# BACKLOG

Status: Living document. Always reflects current state.

---

## Now
- [ ] Apply `supabase/migrations/0001_init.sql` to the Supabase project and set the 3 env vars in Vercel.
- [ ] End-to-end test online play on two devices (create/join, turn handoff, win/lose, restart).
- [ ] Raise difficulty in stages: add traffic / a second airplane per space and re-confirm winnability.
- [ ] Tune YUL approach-track traffic in `src/game/config.ts` to match the full base game.

## Next
- [ ] Online: player presence/disconnect handling (mark `connected`, show partner offline).
- [ ] Online: reconnect/resume into an in-progress game from the home screen.
- [ ] Hide opponent's remaining dice count during a turn (stricter hidden info; online masks values, count still visible).
- [ ] Polish: animations, sound, desktop layout refinements.
- [ ] Validate final-round simultaneous-arrival edge cases against the rules.
- [ ] Optional: in-game language switch (currently splash-screen only) and more languages.

## Later
- [ ] Additional airports / approach tracks (data-driven).
- [ ] Advanced modules (Flight Log challenges).
- [ ] Persistence (resume in-progress game).

## Blocked
- [ ] Agent-run terminal commands (enforced sandbox unsupported on Windows). Workaround: user runs npm in own terminal.

## Done
- [x] Bootstrap context architecture.
- [x] Define product scope and technical architecture.
- [x] Scaffold Vite + React + TS + Tailwind + Vitest.
- [x] Pure game engine: types, config, slots, setup, effects, reducer, selectors.
- [x] Engine unit tests (38 passing).
- [x] Cockpit UI: tracks, axis dial, speed gauge, dice, all action panels.
- [x] Start screen + pass-and-play handoff + briefing/roll + round-end + win/lose.
- [x] Verified build (clean) and full turn loop in the browser.
- [x] Fix: flaps/brakes sequential ordering uses persistent switch state (not the
      current round's slots) and a deployed switch can't be re-used.
- [x] Playtest: deterministic full-game golden-path test proves a win is reachable.
- [x] Tune approach track to an approachable v1 (3 single airplanes, one advance/round).
- [x] Internationalization: EN (default) + FR with a splash-screen language switcher,
      persisted in localStorage; engine emits locale-neutral codes, UI translates.
- [x] Online multiplayer (2026-06-12): home screen (local/online), lobby (nickname,
      create/join, 3-char room code), waiting room with role pick. Server-authoritative
      engine on Vercel Functions (`api/`) + Supabase (Postgres, anon auth, realtime
      ticks), per-player redacted views. Build clean, 47 tests green.
