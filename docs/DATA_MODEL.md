# DATA MODEL

Status: Living document. Update whenever persisted data structure changes.

---

## Source of Truth

Technical_Source: `src/game/types.ts` (TypeScript types) is the executable source of truth for game state.
There is no database; state is in-memory only and resets on reload.

Rule:
- `src/game/types.ts` defines the canonical shapes.
- This document is the human/agent-readable map. It must not contradict the types.

---

## Storage Overview

Database_Type: None.
Persistence_Model: In-memory React state via `useReducer`. No localStorage in v1.

---

## Entities (in-memory state)

### Entity: GameState

Purpose: The complete state of one Sky Team game.
Storage: In-memory.

Fields:
| Field | Type | Required | Notes |
|---|---|---|---|
| phase | 'setup' \| 'briefing' \| 'placement' \| 'roundEnd' \| 'won' \| 'lost' | Yes | Current screen/phase |
| round | number | Yes | 1..7 |
| altitude | number | Yes | 6000 down to 0, step 1000 |
| startingPlayer | 'pilot' \| 'copilot' | Yes | Dictated by altitude track |
| currentPlayer | 'pilot' \| 'copilot' | Yes | Whose turn during placement |
| dice | Record<'pilot'\|'copilot', Die[]> | Yes | 4 each |
| rolled | boolean | Yes | dice rolled this round => silence |
| approach | ApproachSpace[] | Yes | Index 0 = start; last = airport |
| currentPosition | number | Yes | Pointer into approach |
| airportIndex | number | Yes | Index of the airport space (last) |
| axis | number | Yes | Negative=copilot side, 0=level, positive=pilot side |
| axisLimit | number | Yes | Reaching +/- limit = spin out (loss) |
| blueMarker | number | Yes | Aerodynamics (gear) threshold, starts 4.5 |
| orangeMarker | number | Yes | Aerodynamics (flaps) threshold, starts 8.5 |
| brakeStrength | number | Yes | Brake strength, starts 1 (below 2) |
| switches | Switches | Yes | gear[3], flaps[4], brakes[3] booleans |
| coffee | number | Yes | 0..3 |
| rerolls | number | Yes | available reroll tokens |
| slots | Record<SlotId, PlacedDie \| null> | Yes | action-space occupancy |
| landingSpeed | number \| null | Yes | engine sum recorded on the landing round |
| result | 'won' \| 'lost' \| null | Yes | terminal outcome |
| lossReason | LossReason \| null | Yes | locale-neutral crash code; UI translates it (see src/i18n) |
| log | string[] | Yes | human-readable event log (debug only, English) |

### Entity: Die

Fields:
| Field | Type | Required | Notes |
|---|---|---|---|
| id | string | Yes | stable id within a roll |
| owner | 'pilot' \| 'copilot' | Yes | color |
| value | 1..6 | Yes | current face value (after coffee mods) |
| placed | boolean | Yes | placed on a slot this round |

### Entity: ApproachSpace

Fields:
| Field | Type | Required | Notes |
|---|---|---|---|
| traffic | number | Yes | airplane tokens on this space |
| isAirport | boolean | Yes | true for the final space |

### Entity: SlotId (action spaces)

Values: `axis-blue`, `axis-orange`, `engine-blue`, `engine-orange`,
`radio-blue`, `radio-orange-1`, `radio-orange-2`,
`gear-1`,`gear-2`,`gear-3`, `flaps-1`..`flaps-4`, `brakes-1`..`brakes-3`,
`concentration-1`..`concentration-3`.

Each slot has constraints: allowed color(s) and allowed die value(s).

### Entity: Locale-neutral codes

The engine never produces user-facing text. It emits stable codes that the UI maps
to translated strings (`src/i18n`):

- `LossReason`: `spin`, `collision`, `overshoot`, `mandatory`, `notReached`, `landing`.
- `LandingCheckKey` (keys of `landingChecks()`): `traffic`, `gear`, `flaps`, `axis`, `speed`.

---

## Access Model

Roles: pilot, copilot. Enforced by slot color constraints in the engine.
Rules: A die may only be placed on a slot whose color/value constraints it satisfies; mandatory slots (axis, engines) must be filled by round end.

---

## Migration Notes

## 2026-06-07 — Bootstrap

Change: Created empty data model document.
Reason: Future agents need a stable map of persisted data.
Impact: No database selected. No schema defined.

## 2026-06-07 — Sky Team in-memory model

Change: Defined in-memory GameState/Die/ApproachSpace/SlotId shapes for the Sky Team game.
Reason: Implementing the digital game; no persistence, but state shape must be stable and testable.
Impact: No database. `src/game/types.ts` is the source of truth. State resets on reload.

## 2026-06-08 — Locale-neutral engine output (i18n)

Change: `lossReason` is now a `LossReason` code (was a French string); `landingChecks()`
keys are `LandingCheckKey` codes (were French labels). Added `LossReason` / `LandingCheckKey`
to `types.ts`.
Reason: Added language support (EN/FR). The engine must stay locale-free; the UI translates.
Impact: UI reads codes via `src/i18n`. The selected language persists in `localStorage`
(`skyteam.lang`); it is UI-only and not part of `GameState`.
