// Full-game playthrough: a deterministic 7-round "golden path" that lands the
// plane. This proves a win is reachable with the current config and guards the
// whole turn loop (round handoff, mandatory slots, sequential switches across
// rounds, radio-before-advance, aerodynamics thresholds, final braking check)
// against regressions.
//
// Each round is an ordered list of placements in turn order (the starting player
// alternates pilot/co-pilot per round). Die values equal the placed values, so
// no coffee is ever spent. The plan, round by round:
//   - axis stays level: each round places equal blue/orange axis dice (delta 0)
//   - advance exactly one space per round (rounds 1-6) to reach the airport
//   - clear the airplane ahead by Radio before the engines push into it
//   - deploy all gear + flaps in order, then enough brakes to stop
//   - round 7: at the airport, altitude 0, engines = landing speed (< brakes)

import { describe, expect, it } from 'vitest'
import { reducer, type Action } from '../reducer'
import { createInitialState } from '../setup'
import type { DieValue, GameState, Role, SlotId } from '../types'

interface Move {
  role: Role
  slot: SlotId
  value: DieValue
}

// One round: roll the exact dice this script needs, then place them in order.
function playRound(state: GameState, moves: Move[]): GameState {
  const pilot = moves.filter((m) => m.role === 'pilot').map((m) => m.value)
  const copilot = moves.filter((m) => m.role === 'copilot').map((m) => m.value)
  let s = reducer(state, { type: 'ROLL_DICE', values: { pilot, copilot } })
  let pi = 0
  let ci = 0
  for (const m of moves) {
    const dieId = m.role === 'pilot' ? `pilot-${pi++}` : `copilot-${ci++}`
    const action: Action = {
      type: 'PLACE_DIE',
      dieId,
      slotId: m.slot,
      value: m.value,
    }
    s = reducer(s, action)
  }
  return s
}

// Markers start blue 4.5 / orange 8.5 and rise as gear/flaps deploy, so the
// engine sums below keep advancing exactly one space each round.
const ROUNDS: Move[][] = [
  // Round 1 (pilot starts). Clear airplane at space 1, advance 0->1.
  [
    { role: 'pilot', slot: 'radio-blue', value: 2 }, // clears space 1
    { role: 'copilot', slot: 'axis-orange', value: 3 },
    { role: 'pilot', slot: 'axis-blue', value: 3 },
    { role: 'copilot', slot: 'engine-orange', value: 3 },
    { role: 'pilot', slot: 'engine-blue', value: 3 }, // speed 6 -> +1
    { role: 'copilot', slot: 'flaps-1', value: 1 },
    { role: 'pilot', slot: 'gear-1', value: 1 },
    { role: 'copilot', slot: 'concentration-1', value: 4 },
  ],
  // Round 2 (co-pilot starts). Empty space ahead, advance 1->2.
  [
    { role: 'copilot', slot: 'axis-orange', value: 3 },
    { role: 'pilot', slot: 'axis-blue', value: 3 },
    { role: 'copilot', slot: 'engine-orange', value: 4 },
    { role: 'pilot', slot: 'engine-blue', value: 3 }, // speed 7 -> +1
    { role: 'copilot', slot: 'flaps-2', value: 2 },
    { role: 'pilot', slot: 'gear-2', value: 3 },
    { role: 'copilot', slot: 'concentration-1', value: 5 },
    { role: 'pilot', slot: 'concentration-2', value: 5 },
  ],
  // Round 3 (pilot starts). Clear airplane at space 3, advance 2->3.
  [
    { role: 'pilot', slot: 'radio-blue', value: 2 }, // clears space 3
    { role: 'copilot', slot: 'axis-orange', value: 3 },
    { role: 'pilot', slot: 'axis-blue', value: 3 },
    { role: 'copilot', slot: 'engine-orange', value: 4 },
    { role: 'pilot', slot: 'engine-blue', value: 4 }, // speed 8 -> +1
    { role: 'copilot', slot: 'flaps-3', value: 4 },
    { role: 'pilot', slot: 'gear-3', value: 5 },
    { role: 'copilot', slot: 'concentration-1', value: 2 },
  ],
  // Round 4 (co-pilot starts). Empty space ahead, advance 3->4.
  [
    { role: 'copilot', slot: 'axis-orange', value: 3 },
    { role: 'pilot', slot: 'axis-blue', value: 3 },
    { role: 'copilot', slot: 'engine-orange', value: 5 },
    { role: 'pilot', slot: 'engine-blue', value: 4 }, // speed 9 -> +1
    { role: 'copilot', slot: 'flaps-4', value: 5 },
    { role: 'pilot', slot: 'brakes-1', value: 2 },
    { role: 'copilot', slot: 'concentration-1', value: 2 },
    { role: 'pilot', slot: 'concentration-2', value: 2 },
  ],
  // Round 5 (pilot starts). Clear airplane at space 5, advance 4->5.
  [
    { role: 'pilot', slot: 'radio-blue', value: 2 }, // clears space 5
    { role: 'copilot', slot: 'axis-orange', value: 3 },
    { role: 'pilot', slot: 'axis-blue', value: 3 },
    { role: 'copilot', slot: 'engine-orange', value: 5 },
    { role: 'pilot', slot: 'engine-blue', value: 4 }, // speed 9 -> +1
    { role: 'copilot', slot: 'concentration-1', value: 2 },
    { role: 'pilot', slot: 'brakes-2', value: 4 },
    { role: 'copilot', slot: 'concentration-2', value: 2 },
  ],
  // Round 6 (co-pilot starts). Advance 5->6 onto the airport.
  [
    { role: 'copilot', slot: 'axis-orange', value: 3 },
    { role: 'pilot', slot: 'axis-blue', value: 3 },
    { role: 'copilot', slot: 'engine-orange', value: 5 },
    { role: 'pilot', slot: 'engine-blue', value: 4 }, // speed 9 -> +1
    { role: 'copilot', slot: 'concentration-1', value: 2 },
    { role: 'pilot', slot: 'concentration-2', value: 2 },
    { role: 'copilot', slot: 'concentration-3', value: 2 },
    { role: 'pilot', slot: 'radio-blue', value: 2 }, // no target, harmless
  ],
  // Round 7 (pilot starts). Landing round: engines = braking speed, no move.
  [
    { role: 'pilot', slot: 'axis-blue', value: 3 },
    { role: 'copilot', slot: 'axis-orange', value: 3 },
    { role: 'pilot', slot: 'engine-blue', value: 2 },
    { role: 'copilot', slot: 'engine-orange', value: 2 }, // landing speed 4 < 4.5
    { role: 'pilot', slot: 'concentration-1', value: 2 },
    { role: 'copilot', slot: 'concentration-2', value: 2 },
    { role: 'pilot', slot: 'concentration-3', value: 2 },
    { role: 'copilot', slot: 'radio-orange-1', value: 2 },
  ],
]

describe('full-game playthrough (golden path)', () => {
  it('lands the plane after 7 rounds', () => {
    let s = reducer(createInitialState(), { type: 'START_GAME' })
    expect(s.phase).toBe('briefing')

    for (let r = 0; r < ROUNDS.length; r++) {
      s = playRound(s, ROUNDS[r])
      expect(s.result, `round ${r + 1} should not end the game early`).toBe(
        r === ROUNDS.length - 1 ? 'won' : null,
      )
      if (r < ROUNDS.length - 1) {
        // Advanced exactly one space per round on the way to the airport.
        expect(s.currentPosition, `position after round ${r + 1}`).toBe(r + 1)
        expect(s.phase).toBe('roundEnd')
        s = reducer(s, { type: 'NEXT_ROUND' })
        expect(s.phase).toBe('briefing')
      }
    }

    expect(s.phase).toBe('won')
    expect(s.currentPosition).toBe(s.airportIndex)
    expect(s.approach.every((sp) => sp.traffic === 0)).toBe(true)
    expect(s.switches.gear.every(Boolean)).toBe(true)
    expect(s.switches.flaps.every(Boolean)).toBe(true)
    expect(s.axis).toBe(0)
    expect(s.landingSpeed).toBeLessThan(s.brakeStrength)
  })
})
