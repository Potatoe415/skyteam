# Sky Team (digital)

A faithful web implementation of the 2-player cooperative board game **Sky Team**,
playable hotseat (pass-and-play) on a single phone, and on desktop.

- Pilot (blue) and Co-Pilot (orange) cooperate to land an airliner over 7 rounds.
- Mobile-first UI; works on desktop too.
- Fully client-side: no backend, no accounts, no network.

> Game by Luc Rémond, published by Le Scorpion Masqué. This is an unofficial
> digital re-implementation for personal use; all rights to Sky Team belong to
> their owners.

## Tech stack

- Vite 5 + React 18 + TypeScript
- Tailwind CSS 3 (mobile-first)
- Vitest (unit tests for the pure game engine)

The rules engine lives in `src/game/` and imports nothing from React, so it is
fully unit-tested. The UI in `src/components/` only reads state and dispatches
actions.

## Getting started

```bash
npm install
npm run dev      # http://localhost:5173
```

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the dev server |
| `npm test` | Run engine unit tests once |
| `npm run test:watch` | Watch-mode tests |
| `npm run build` | Type-check + production build to `dist/` |
| `npm run preview` | Preview the production build |

## How to play (digital)

1. Choose roles (Pilot / Co-Pilot) and confirm.
2. Each round: discuss strategy, then roll. After rolling, stay silent.
3. Take turns placing exactly one die on a legal action space.
4. Fill both Axis and both Engine spaces every round or you crash.
5. Manage speed, traffic, axis, gear, flaps; brake on the final round to land.

See `docs/sky_team_rules_verbatim.md` for the full official rules and
`docs/sky_team_game_design_doc.md` for the implementation logic.

## Project structure

```
src/
  game/         # pure, framework-free rules engine (+ tests)
  components/    # cockpit UI
  hooks/         # React glue (useGame)
docs/            # rules, design doc, product/tech/decision logs
```
