# STATE

Rule: Replace content on every update. Never append history here. Max 60 lines.
History lives in `docs/DECISIONS.md` (decisions) and `docs/BACKLOG.md` (tasks).

---

Status: Playable v1, win confirmed reachable, EN/FR localized, board-faithful cockpit skin.
Current_Goal: Tune difficulty upward in stages while keeping the game winnable.
Next_Actions:
- Raise traffic gradually (more airplanes per space) and re-confirm winnability.
- Tune `createYulApproach()` toward the full official base game.
- Optional: hide opponent dice count, add animations, persistence, more languages.

Open_Questions:
- Exact YUL approach-track traffic distribution (v1 = gentle approximation in `src/game/config.ts`).
- Final-round simultaneous-arrival handling is a pragmatic interpretation (see DECISIONS).

Recent_Changes:
- 2026-06-07 Added full-game golden-path integration test (proves a clean landing). Tuned approach track to an approachable v1.
- 2026-06-08 Added i18n (EN default + FR) with a splash-screen language switcher (persisted in localStorage). Engine now emits locale-neutral codes; UI translates via `src/i18n`. 38 tests green; build clean; toggle verified in-browser.
- 2026-06-08 Reskinned UI to match the physical board (`docs/screenshot-skyteam.png`): brushed-steel cockpit, recessed color-coded action tiles with "?" help dots, attitude indicator with compass ticks + spin-out markers, metallic tracks, themed speed gauge, boarding-pass role cards. Presentational only (engine untouched); 38 tests green, build clean, verified in-browser.
- 2026-06-08 Fixed handoff privacy leak: dice tray no longer renders during a pass-and-play handoff, and the handoff screen is now a fully opaque viewport-cover (`Shell solid`) so the previous player's dice can't show through. Verified in-browser.
