// Full end-to-end game simulation.
//
// Covers nine distinct scenarios so every branch of the engine can be observed
// "in motion" (not just via isolated unit tests):
//
//   1. Complete 7-round winning game — per-round state inspection
//   2. Spin-out loss (immediate, single axis pair)
//   3. Cumulative spin-out across two rounds
//   4. Collision with uncleared traffic
//   5. Mandatory slots left unfilled at round end
//   6. Landing speed exceeds brake strength (crash on touchdown)
//   7. Overshoot past the airport
//   8. Coffee mechanic — concentration → die offset
//   9. Reroll tokens — grant on rounds 1 & 4, spend via USE_REROLL
//
// All die values are deterministic (supplied through ROLL_DICE).
// Move lists follow actual turn order: starting player first, alternating.

import { describe, expect, it } from 'vitest'
import { reducer } from '../reducer'
import { createInitialState } from '../setup'
import type { DieValue, GameState, Role, SlotId } from '../types'

// ─── helpers ─────────────────────────────────────────────────────────────────

interface Move {
  role: Role
  slot: SlotId
  value: DieValue
}

function startGame(): GameState {
  return reducer(createInitialState(), { type: 'START_GAME' })
}

/**
 * Roll exactly the dice the script requires (in move order) then place every
 * die listed in `moves`.  The die-ID counters pi/ci track how many pilot /
 * copilot placements have already occurred, matching `createDice`'s `owner-N`
 * naming scheme.
 */
function rollAndPlace(state: GameState, moves: Move[]): GameState {
  const pilot = moves.filter((m) => m.role === 'pilot').map((m) => m.value)
  const copilot = moves.filter((m) => m.role === 'copilot').map((m) => m.value)
  let s = reducer(state, { type: 'ROLL_DICE', values: { pilot, copilot } })
  let pi = 0,
    ci = 0
  for (const m of moves) {
    const dieId = m.role === 'pilot' ? `pilot-${pi++}` : `copilot-${ci++}`
    s = reducer(s, { type: 'PLACE_DIE', dieId, slotId: m.slot, value: m.value })
  }
  return s
}

function nextRound(s: GameState): GameState {
  return reducer(s, { type: 'NEXT_ROUND' })
}

// ─── Golden path (7 rounds) ──────────────────────────────────────────────────
//
// Reused across the winning-game scenario and the "landing speed" loss variant.
// Strategy:
//   • axis always balanced (blue = orange = 3, cumulative delta = 0)
//   • advance exactly one space per round via aerodynamics
//   • clear every traffic token by radio before the engines push into it
//   • deploy all gear + all flaps sequentially; 2 brakes → brakeStrength 4.5
//   • round 7 landing speed = 4 < 4.5 → victory

const GOLDEN: Move[][] = [
  // Round 1 — pilot starts, 6000 ft — clear pos 1, advance 0→1, gear-1, flaps-1
  [
    { role: 'pilot', slot: 'radio-blue', value: 2 }, // clears approach[1]
    { role: 'copilot', slot: 'axis-orange', value: 3 },
    { role: 'pilot', slot: 'axis-blue', value: 3 }, // axis += 0
    { role: 'copilot', slot: 'engine-orange', value: 3 },
    { role: 'pilot', slot: 'engine-blue', value: 3 }, // speed 6 → +1
    { role: 'copilot', slot: 'flaps-1', value: 1 }, // orangeMarker → 9.5
    { role: 'pilot', slot: 'gear-1', value: 1 }, // blueMarker  → 5.5
    { role: 'copilot', slot: 'concentration-1', value: 4 }, // coffee → 1
  ],
  // Round 2 — copilot starts, 5000 ft — advance 1→2, gear-2, flaps-2
  [
    { role: 'copilot', slot: 'axis-orange', value: 3 },
    { role: 'pilot', slot: 'axis-blue', value: 3 },
    { role: 'copilot', slot: 'engine-orange', value: 4 },
    { role: 'pilot', slot: 'engine-blue', value: 3 }, // speed 7 → +1
    { role: 'copilot', slot: 'flaps-2', value: 2 }, // orangeMarker → 10.5
    { role: 'pilot', slot: 'gear-2', value: 3 }, // blueMarker  → 6.5
    { role: 'copilot', slot: 'concentration-1', value: 5 }, // coffee → 2
    { role: 'pilot', slot: 'concentration-2', value: 5 }, // coffee → 3
  ],
  // Round 3 — pilot starts, 4000 ft — clear pos 3, advance 2→3, gear-3, flaps-3
  [
    { role: 'pilot', slot: 'radio-blue', value: 2 }, // clears approach[3]
    { role: 'copilot', slot: 'axis-orange', value: 3 },
    { role: 'pilot', slot: 'axis-blue', value: 3 },
    { role: 'copilot', slot: 'engine-orange', value: 4 },
    { role: 'pilot', slot: 'engine-blue', value: 4 }, // speed 8 → +1
    { role: 'copilot', slot: 'flaps-3', value: 4 }, // orangeMarker → 11.5
    { role: 'pilot', slot: 'gear-3', value: 5 }, // blueMarker  → 7.5 (all gear)
    { role: 'copilot', slot: 'concentration-1', value: 2 }, // coffee capped at 3
  ],
  // Round 4 — copilot starts, 3000 ft — advance 3→4, flaps-4, brakes-1
  [
    { role: 'copilot', slot: 'axis-orange', value: 3 },
    { role: 'pilot', slot: 'axis-blue', value: 3 },
    { role: 'copilot', slot: 'engine-orange', value: 5 },
    { role: 'pilot', slot: 'engine-blue', value: 4 }, // speed 9 → +1
    { role: 'copilot', slot: 'flaps-4', value: 5 }, // orangeMarker → 12.5 (all flaps)
    { role: 'pilot', slot: 'brakes-1', value: 2 }, // brakeStrength → 2.5
    { role: 'copilot', slot: 'concentration-1', value: 2 },
    { role: 'pilot', slot: 'concentration-2', value: 2 },
  ],
  // Round 5 — pilot starts, 2000 ft — clear pos 5, advance 4→5, brakes-2
  [
    { role: 'pilot', slot: 'radio-blue', value: 2 }, // clears approach[5]
    { role: 'copilot', slot: 'axis-orange', value: 3 },
    { role: 'pilot', slot: 'axis-blue', value: 3 },
    { role: 'copilot', slot: 'engine-orange', value: 5 },
    { role: 'pilot', slot: 'engine-blue', value: 4 }, // speed 9 → +1
    { role: 'copilot', slot: 'concentration-1', value: 2 },
    { role: 'pilot', slot: 'brakes-2', value: 4 }, // brakeStrength → 4.5
    { role: 'copilot', slot: 'concentration-2', value: 2 },
  ],
  // Round 6 — copilot starts, 1000 ft — advance 5→6 (airport)
  [
    { role: 'copilot', slot: 'axis-orange', value: 3 },
    { role: 'pilot', slot: 'axis-blue', value: 3 },
    { role: 'copilot', slot: 'engine-orange', value: 5 },
    { role: 'pilot', slot: 'engine-blue', value: 4 }, // speed 9 → +1
    { role: 'copilot', slot: 'concentration-1', value: 2 },
    { role: 'pilot', slot: 'concentration-2', value: 2 },
    { role: 'copilot', slot: 'concentration-3', value: 2 },
    { role: 'pilot', slot: 'radio-blue', value: 2 }, // harmless: no target
  ],
  // Round 7 — pilot starts, 0 ft — landing: speed 4 < brakeStrength 4.5 → WIN
  [
    { role: 'pilot', slot: 'axis-blue', value: 3 },
    { role: 'copilot', slot: 'axis-orange', value: 3 },
    { role: 'pilot', slot: 'engine-blue', value: 2 },
    { role: 'copilot', slot: 'engine-orange', value: 2 }, // landingSpeed = 4
    { role: 'pilot', slot: 'concentration-1', value: 2 },
    { role: 'copilot', slot: 'concentration-2', value: 2 },
    { role: 'pilot', slot: 'concentration-3', value: 2 },
    { role: 'copilot', slot: 'radio-orange-1', value: 2 },
  ],
]

// ─── Scenario 1: complete 7-round winning game ────────────────────────────────

describe('Scenario 1 — complete 7-round winning game', () => {
  it('lands the plane safely, tracking full state at every round boundary', () => {
    let s = startGame()
    expect(s.phase).toBe('briefing')
    expect(s.round).toBe(1)
    expect(s.altitude).toBe(6000)
    expect(s.rerolls).toBe(1) // round-1 token granted by START_GAME

    // ── Round 1 ─────────────────────────────────────────────────────────────
    s = rollAndPlace(s, GOLDEN[0])

    expect(s.result, 'R1 must not end the game').toBeNull()
    expect(s.phase).toBe('roundEnd')
    expect(s.currentPosition).toBe(1)
    expect(s.axis).toBe(0) // 3 - 3 = 0
    expect(s.approach[1].traffic).toBe(0) // cleared by radio-blue=2
    expect(s.switches.gear).toEqual([true, false, false])
    expect(s.switches.flaps).toEqual([true, false, false, false])
    expect(s.blueMarker).toBeCloseTo(5.5) // +1 from gear-1
    expect(s.orangeMarker).toBeCloseTo(9.5) // +1 from flaps-1
    expect(s.coffee).toBe(1) // one concentration

    s = nextRound(s)
    expect(s.phase).toBe('briefing')
    expect(s.round).toBe(2)
    expect(s.altitude).toBe(5000)
    expect(s.startingPlayer).toBe('copilot') // even round → copilot starts

    // ── Round 2 ─────────────────────────────────────────────────────────────
    s = rollAndPlace(s, GOLDEN[1])

    expect(s.result, 'R2 must not end the game').toBeNull()
    expect(s.currentPosition).toBe(2)
    expect(s.axis).toBe(0)
    expect(s.switches.gear).toEqual([true, true, false])
    expect(s.switches.flaps).toEqual([true, true, false, false])
    expect(s.blueMarker).toBeCloseTo(6.5) // +2 gear total
    expect(s.orangeMarker).toBeCloseTo(10.5) // +2 flaps total
    expect(s.coffee).toBe(3) // two more concentrations pushed from 1 → 3

    s = nextRound(s)
    expect(s.round).toBe(3)
    expect(s.rerolls).toBe(1) // no new grant (round 3 ∉ REROLL_ROUNDS)

    // ── Round 3 ─────────────────────────────────────────────────────────────
    s = rollAndPlace(s, GOLDEN[2])

    expect(s.result, 'R3 must not end the game').toBeNull()
    expect(s.currentPosition).toBe(3)
    expect(s.approach[3].traffic).toBe(0) // cleared by radio-blue=2
    expect(s.switches.gear).toEqual([true, true, true]) // all gear deployed
    expect(s.switches.flaps).toEqual([true, true, true, false])
    expect(s.blueMarker).toBeCloseTo(7.5) // +3 gear total
    expect(s.orangeMarker).toBeCloseTo(11.5) // +3 flaps total

    s = nextRound(s)
    expect(s.round).toBe(4)
    expect(s.altitude).toBe(3000)
    expect(s.rerolls).toBe(2) // round 4 ∈ REROLL_ROUNDS → +1 → total 2

    // ── Round 4 ─────────────────────────────────────────────────────────────
    s = rollAndPlace(s, GOLDEN[3])

    expect(s.result, 'R4 must not end the game').toBeNull()
    expect(s.currentPosition).toBe(4)
    expect(s.switches.flaps).toEqual([true, true, true, true]) // all flaps deployed
    expect(s.switches.brakes).toEqual([true, false, false])
    expect(s.orangeMarker).toBeCloseTo(12.5) // +4 flaps total
    expect(s.brakeStrength).toBe(2.5) // BRAKE_STRENGTHS[1]

    s = nextRound(s)
    expect(s.round).toBe(5)

    // ── Round 5 ─────────────────────────────────────────────────────────────
    s = rollAndPlace(s, GOLDEN[4])

    expect(s.result, 'R5 must not end the game').toBeNull()
    expect(s.currentPosition).toBe(5)
    expect(s.approach[5].traffic).toBe(0) // cleared by radio-blue=2
    expect(s.switches.brakes).toEqual([true, true, false])
    expect(s.brakeStrength).toBe(4.5) // BRAKE_STRENGTHS[2]

    s = nextRound(s)
    expect(s.round).toBe(6)
    expect(s.altitude).toBe(1000)

    // ── Round 6 ─────────────────────────────────────────────────────────────
    s = rollAndPlace(s, GOLDEN[5])

    expect(s.result, 'R6 must not end the game').toBeNull()
    expect(s.currentPosition).toBe(s.airportIndex) // arrived at the airport
    expect(s.axis).toBe(0)

    s = nextRound(s)
    expect(s.round).toBe(7)
    expect(s.altitude).toBe(0) // landing round

    // ── Round 7 — touchdown ──────────────────────────────────────────────────
    s = rollAndPlace(s, GOLDEN[6])

    expect(s.phase).toBe('won')
    expect(s.result).toBe('won')
    // All five landing checks pass:
    expect(s.approach.every((sp) => sp.traffic === 0)).toBe(true) // traffic
    expect(s.switches.gear.every(Boolean)).toBe(true) // gear
    expect(s.switches.flaps.every(Boolean)).toBe(true) // flaps
    expect(s.axis).toBe(0) // axis
    expect(s.landingSpeed).toBe(4) // 2+2
    expect(s.brakeStrength).toBe(4.5)
    expect(s.landingSpeed).toBeLessThan(s.brakeStrength) // 4 < 4.5 ✓
  })
})

// ─── Scenario 2: immediate spin-out ──────────────────────────────────────────

describe('Scenario 2 — loss: axis spin-out (immediate)', () => {
  it('loses as soon as the axis pair completes at ±5', () => {
    let s = startGame()
    s = reducer(s, {
      type: 'ROLL_DICE',
      values: { pilot: [6, 3, 1, 3], copilot: [1, 3, 1, 3] },
    })
    expect(s.phase).toBe('placement')
    expect(s.axis).toBe(0)

    // Pilot places axis-blue = 6 — effect waits for the pair.
    s = reducer(s, { type: 'PLACE_DIE', dieId: 'pilot-0', slotId: 'axis-blue', value: 6 })
    expect(s.axis).toBe(0) // not yet resolved
    expect(s.result).toBeNull()

    // Co-pilot places axis-orange = 1 → applyAxis fires: 6 - 1 = 5 → spin!
    s = reducer(s, { type: 'PLACE_DIE', dieId: 'copilot-0', slotId: 'axis-orange', value: 1 })
    expect(s.axis).toBe(5)
    expect(s.result).toBe('lost')
    expect(s.lossReason).toBe('spin')
    expect(s.phase).toBe('lost')
  })
})

// ─── Scenario 3: cumulative axis spin across two rounds ───────────────────────

describe('Scenario 3 — loss: cumulative axis spin across two rounds', () => {
  it('survives round 1 with axis +3 but spins out in round 2 when it reaches +5', () => {
    let s = startGame()

    // Round 1 (pilot starts): axis += 5 - 2 = +3.  Clear pos-1 radio before
    // engines fire so the advance to position 1 does not cause a collision.
    s = rollAndPlace(s, [
      { role: 'pilot', slot: 'axis-blue', value: 5 }, // pilot-0
      { role: 'copilot', slot: 'axis-orange', value: 2 }, // copilot-0 → axis=3
      { role: 'pilot', slot: 'engine-blue', value: 3 }, // pilot-1
      { role: 'copilot', slot: 'radio-orange-1', value: 2 }, // copilot-1 → clear pos 1
      { role: 'pilot', slot: 'gear-1', value: 2 }, // pilot-2
      { role: 'copilot', slot: 'engine-orange', value: 3 }, // copilot-2 → speed 6, +1
      { role: 'pilot', slot: 'concentration-1', value: 3 }, // pilot-3
      { role: 'copilot', slot: 'flaps-1', value: 1 }, // copilot-3
    ])
    expect(s.result).toBeNull()
    expect(s.axis).toBe(3) // tilt carried forward
    expect(s.currentPosition).toBe(1)

    s = nextRound(s)
    expect(s.round).toBe(2)
    expect(s.axis).toBe(3) // axis is not reset between rounds

    // Round 2 (copilot starts): axis += 5 - 3 = +2 → cumulative 3 + 2 = 5 → spin.
    s = rollAndPlace(s, [
      { role: 'copilot', slot: 'axis-orange', value: 3 }, // copilot-0
      { role: 'pilot', slot: 'axis-blue', value: 5 }, // pilot-0 → axis=5 → SPIN
    ])
    expect(s.axis).toBe(5)
    expect(s.result).toBe('lost')
    expect(s.lossReason).toBe('spin')
  })
})

// ─── Scenario 4: collision with uncleared traffic ─────────────────────────────

describe('Scenario 4 — loss: collision with uncleared traffic', () => {
  it('loses when engines advance into a space the radio never cleared', () => {
    let s = startGame()
    s = reducer(s, {
      type: 'ROLL_DICE',
      values: { pilot: [3, 3, 3, 3], copilot: [3, 3, 3, 3] },
    })

    // Balance the axis first.
    s = reducer(s, { type: 'PLACE_DIE', dieId: 'pilot-0', slotId: 'axis-blue', value: 3 })
    s = reducer(s, { type: 'PLACE_DIE', dieId: 'copilot-0', slotId: 'axis-orange', value: 3 })
    expect(s.axis).toBe(0)
    expect(s.currentPosition).toBe(0)

    // Fire engines without using radio to clear space 1 first.
    s = reducer(s, { type: 'PLACE_DIE', dieId: 'pilot-1', slotId: 'engine-blue', value: 3 })
    expect(s.result).toBeNull() // pair not yet complete

    s = reducer(s, { type: 'PLACE_DIE', dieId: 'copilot-1', slotId: 'engine-orange', value: 3 })
    // speed = 6 ≥ blueMarker (4.5) → advance 1 → land on pos 1 which still has traffic
    expect(s.currentPosition).toBe(1)
    expect(s.result).toBe('lost')
    expect(s.lossReason).toBe('collision')
  })
})

// ─── Scenario 5: mandatory slots left unfilled ────────────────────────────────

describe('Scenario 5 — loss: mandatory slots left unfilled at round end', () => {
  it('loses when the copilot uses every die on optional slots, skipping axis-orange and engine-orange', () => {
    let s = startGame()

    // Copilot deliberately never fills axis-orange or engine-orange.
    // Pilot fills its own two mandatory slots (axis-blue, engine-blue) plus
    // gear-1 and concentration-1.
    s = rollAndPlace(s, [
      { role: 'pilot', slot: 'axis-blue', value: 3 }, // pilot-0
      { role: 'copilot', slot: 'concentration-2', value: 4 }, // copilot-0 → coffee=1
      { role: 'pilot', slot: 'engine-blue', value: 3 }, // pilot-1
      { role: 'copilot', slot: 'radio-orange-1', value: 2 }, // copilot-1
      { role: 'pilot', slot: 'gear-1', value: 1 }, // pilot-2
      { role: 'copilot', slot: 'concentration-3', value: 3 }, // copilot-2 → coffee=2
      { role: 'pilot', slot: 'concentration-1', value: 3 }, // pilot-3 → coffee=3
      { role: 'copilot', slot: 'radio-orange-2', value: 3 }, // copilot-3 → resolve
    ])

    // All 8 dice placed; axis-orange and engine-orange were never touched.
    expect(s.slots['axis-orange']).toBeNull()
    expect(s.slots['engine-orange']).toBeNull()
    expect(s.result).toBe('lost')
    expect(s.lossReason).toBe('mandatory')
    expect(s.phase).toBe('lost')
  })
})

// ─── Scenario 6: landing speed exceeds brake strength ────────────────────────

describe('Scenario 6 — loss: landing speed exceeds brake strength', () => {
  it('loses on round 7 when engine sum is not strictly below the deployed brakes', () => {
    // Play rounds 1-6 from the golden path: all gear + all flaps deployed,
    // 2 brakes → brakeStrength = 4.5, plane arrives at the airport.
    let s = startGame()
    for (let r = 0; r < 6; r++) {
      s = rollAndPlace(s, GOLDEN[r])
      expect(s.result, `round ${r + 1} should not fail early`).toBeNull()
      s = nextRound(s)
    }
    expect(s.round).toBe(7)
    expect(s.currentPosition).toBe(s.airportIndex)
    expect(s.brakeStrength).toBe(4.5)

    // Round 7: landing speed = 3+2 = 5.  The check is 5 < 4.5 → false → crash.
    s = rollAndPlace(s, [
      { role: 'pilot', slot: 'axis-blue', value: 3 }, // pilot-0
      { role: 'copilot', slot: 'axis-orange', value: 3 }, // copilot-0 → axis=0
      { role: 'pilot', slot: 'engine-blue', value: 3 }, // pilot-1
      { role: 'copilot', slot: 'engine-orange', value: 2 }, // copilot-1 → landingSpeed=5
      { role: 'pilot', slot: 'concentration-1', value: 2 }, // pilot-2
      { role: 'copilot', slot: 'concentration-2', value: 2 }, // copilot-2
      { role: 'pilot', slot: 'concentration-3', value: 2 }, // pilot-3
      { role: 'copilot', slot: 'radio-orange-1', value: 2 }, // copilot-3 → resolve
    ])

    expect(s.landingSpeed).toBe(5)
    expect(s.brakeStrength).toBe(4.5)
    expect(s.landingSpeed).toBeGreaterThanOrEqual(s.brakeStrength) // confirms the failing check
    expect(s.result).toBe('lost')
    expect(s.lossReason).toBe('landing')
  })
})

// ─── Scenario 7: overshoot past the airport ──────────────────────────────────

describe('Scenario 7 — loss: overshoot past the airport', () => {
  it('loses when high engine speed would push the plane beyond the airport index', () => {
    // Strategy: reach position 5 in 3 rounds (no flaps → orangeMarker stays 8.5),
    // then in round 4 a speed of 9 advances 2 → target 7 > airportIndex 6 → overshoot.
    //
    // Rounds 1-2 advance by 2 per round (speed 9 skips intermediate traffic).
    // Round 3 clears pos-5 via radio then advances by 1 (speed 6).
    // Round 4 fires speed 9 again → overshoot.

    let s = startGame()

    // Round 1 (pilot starts): 0 → 2, skip traffic at pos 1
    s = rollAndPlace(s, [
      { role: 'pilot', slot: 'axis-blue', value: 3 }, // pilot-0
      { role: 'copilot', slot: 'axis-orange', value: 3 }, // copilot-0 → axis=0
      { role: 'pilot', slot: 'engine-blue', value: 5 }, // pilot-1
      { role: 'copilot', slot: 'engine-orange', value: 4 }, // copilot-1 → speed 9, +2
      { role: 'pilot', slot: 'gear-1', value: 1 }, // pilot-2
      { role: 'copilot', slot: 'concentration-1', value: 3 }, // copilot-2
      { role: 'pilot', slot: 'concentration-2', value: 3 }, // pilot-3
      { role: 'copilot', slot: 'radio-orange-1', value: 3 }, // copilot-3
    ])
    expect(s.result).toBeNull()
    expect(s.currentPosition).toBe(2) // skipped pos 1's traffic
    s = nextRound(s)

    // Round 2 (copilot starts): 2 → 4, skip traffic at pos 3
    s = rollAndPlace(s, [
      { role: 'copilot', slot: 'axis-orange', value: 3 }, // copilot-0
      { role: 'pilot', slot: 'axis-blue', value: 3 }, // pilot-0 → axis=0
      { role: 'copilot', slot: 'engine-orange', value: 4 }, // copilot-1
      { role: 'pilot', slot: 'engine-blue', value: 5 }, // pilot-1 → speed 9, +2
      { role: 'copilot', slot: 'concentration-1', value: 3 }, // copilot-2
      { role: 'pilot', slot: 'concentration-2', value: 3 }, // pilot-2
      { role: 'copilot', slot: 'radio-orange-1', value: 3 }, // copilot-3
      { role: 'pilot', slot: 'radio-blue', value: 3 }, // pilot-3
    ])
    expect(s.result).toBeNull()
    expect(s.currentPosition).toBe(4)
    s = nextRound(s)

    // Round 3 (pilot starts): clear pos 5, then 4 → 5 (speed 6, advance 1)
    // blueMarker is now 5.5 (gear-1 from round 1), so speed 6 still gives +1.
    s = rollAndPlace(s, [
      { role: 'pilot', slot: 'radio-blue', value: 2 }, // pilot-0 → clears pos 5
      { role: 'copilot', slot: 'axis-orange', value: 3 }, // copilot-0
      { role: 'pilot', slot: 'axis-blue', value: 3 }, // pilot-1 → axis=0
      { role: 'copilot', slot: 'engine-orange', value: 3 }, // copilot-1
      { role: 'pilot', slot: 'engine-blue', value: 3 }, // pilot-2 → speed 6, +1
      { role: 'copilot', slot: 'concentration-1', value: 3 }, // copilot-2
      { role: 'pilot', slot: 'concentration-2', value: 3 }, // pilot-3
      { role: 'copilot', slot: 'radio-orange-1', value: 3 }, // copilot-3
    ])
    expect(s.result).toBeNull()
    expect(s.currentPosition).toBe(5)
    expect(s.approach[5].traffic).toBe(0) // cleared
    s = nextRound(s)

    // Round 4 (copilot starts): speed 9 → advance 2 → target 7 > airportIndex 6
    s = rollAndPlace(s, [
      { role: 'copilot', slot: 'axis-orange', value: 3 }, // copilot-0
      { role: 'pilot', slot: 'axis-blue', value: 3 }, // pilot-0
      { role: 'copilot', slot: 'engine-orange', value: 4 }, // copilot-1
      { role: 'pilot', slot: 'engine-blue', value: 5 }, // pilot-1 → speed 9, OVERSHOOT
    ])
    expect(s.result).toBe('lost')
    expect(s.lossReason).toBe('overshoot')
  })
})

// ─── Scenario 8: coffee mechanic ─────────────────────────────────────────────

describe('Scenario 8 — coffee: concentration generates a token that offsets a die', () => {
  it('blocks placement when coffee is zero but allows it after generating one token', () => {
    let s = startGame()
    // All dice show 3; brakes-1 accepts only value [2], so a bare placement costs 1 coffee.
    s = reducer(s, {
      type: 'ROLL_DICE',
      values: { pilot: [3, 3, 3, 3], copilot: [3, 3, 3, 3] },
    })
    expect(s.coffee).toBe(0)

    // Without any coffee: trying to place die(3) on brakes-1 as value 2 is rejected.
    const sBlocked = reducer(s, {
      type: 'PLACE_DIE',
      dieId: 'pilot-0',
      slotId: 'brakes-1',
      value: 2,
    })
    expect(sBlocked.slots['brakes-1']).toBeNull() // silently rejected
    expect(sBlocked.coffee).toBe(0) // no coffee consumed

    // Pilot places on concentration-1 (pilot goes first, any value) → coffee = 1.
    s = reducer(s, {
      type: 'PLACE_DIE',
      dieId: 'pilot-0',
      slotId: 'concentration-1',
      value: 3,
    })
    expect(s.coffee).toBe(1)

    // Co-pilot fills axis-orange (to return the turn to pilot).
    s = reducer(s, {
      type: 'PLACE_DIE',
      dieId: 'copilot-0',
      slotId: 'axis-orange',
      value: 3,
    })

    // Now pilot-1 (die value = 3) can reach brakes-1 as value 2 by spending 1 coffee.
    expect(s.coffee).toBe(1)
    s = reducer(s, {
      type: 'PLACE_DIE',
      dieId: 'pilot-1',
      slotId: 'brakes-1',
      value: 2, // die shows 3; offset = 1 = exact coffee available
    })
    expect(s.coffee).toBe(0) // 1 token spent
    expect(s.slots['brakes-1']).not.toBeNull()
    expect(s.slots['brakes-1']?.value).toBe(2) // stored at the adjusted value
    expect(s.switches.brakes[0]).toBe(true)
    expect(s.brakeStrength).toBe(2.5) // BRAKE_STRENGTHS[1]
  })
})

// ─── Scenario 9: reroll tokens ───────────────────────────────────────────────

describe('Scenario 9 — reroll tokens: grant on rounds 1 & 4, spend via USE_REROLL', () => {
  it('grants 1 token at round 1 start, consumes it on USE_REROLL, then grants a second at round 4', () => {
    // — Round 1 grant & spend —
    let s = startGame()
    expect(s.rerolls).toBe(1) // granted by startGame / START_GAME

    s = reducer(s, {
      type: 'ROLL_DICE',
      values: { pilot: [1, 1, 1, 1], copilot: [1, 1, 1, 1] },
    })
    expect(s.rerolls).toBe(1) // unaffected by rolling
    expect(s.phase).toBe('placement')

    // Reroll two of the pilot's dice.
    s = reducer(s, { type: 'USE_REROLL', dieIds: ['pilot-0', 'pilot-1'] })
    expect(s.rerolls).toBe(0) // token consumed

    // A second USE_REROLL with no remaining tokens is a no-op.
    const coffeeBeforeSecond = s.coffee
    const die2ValueBefore = s.dice.pilot[2].value
    s = reducer(s, { type: 'USE_REROLL', dieIds: ['pilot-2'] })
    expect(s.rerolls).toBe(0)
    expect(s.dice.pilot[2].value).toBe(die2ValueBefore) // not changed
    expect(s.coffee).toBe(coffeeBeforeSecond) // nothing else mutated

    // — Round 4 grant —
    // Play rounds 1-3 from the golden path (token never spent), then advance
    // to round 4 where startNextRound grants a fresh token.
    s = startGame()
    for (let r = 0; r < 3; r++) {
      s = rollAndPlace(s, GOLDEN[r])
      s = nextRound(s)
    }
    expect(s.round).toBe(4)
    // 1 (unused from R1) + 1 (newly granted for R4) = 2
    expect(s.rerolls).toBe(2)
  })
})
