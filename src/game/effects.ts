// Immediate action effects + crash detection. All functions mutate the draft
// state (the reducer clones before calling these). Each effect mirrors a rule
// section in docs/sky_team_rules_verbatim.md.

import { BRAKE_STRENGTHS } from './config'
import { getSlot } from './slots'
import type { GameState, LossReason, SlotId } from './types'

// Records a loss by storing a locale-neutral code; the UI renders the message.
export function lose(s: GameState, reason: LossReason): void {
  if (s.result) return
  s.result = 'lost'
  s.phase = 'lost'
  s.lossReason = reason
  s.log.push(`Defeat: ${reason}`)
}

// Is this the landing round? Altitude 0 (round 7) and parked on the airport.
export function isLandingRound(s: GameState): boolean {
  return s.altitude === 0 && s.currentPosition === s.airportIndex
}

// Aerodynamics: how many spaces a given speed advances the Approach Track.
export function aeroAdvance(s: GameState, speed: number): 0 | 1 | 2 {
  if (speed < s.blueMarker) return 0
  if (speed <= s.orangeMarker) return 1
  return 2
}

// Advance the Approach Track by n spaces, checking overshoot and collision.
export function moveApproach(s: GameState, n: number): void {
  if (n <= 0 || s.result) return
  if (s.currentPosition === s.airportIndex) {
    lose(s, 'overshoot')
    return
  }
  const target = s.currentPosition + n
  if (target > s.airportIndex) {
    lose(s, 'overshoot')
    return
  }
  s.currentPosition = target
  if (s.approach[target].traffic > 0) lose(s, 'collision')
}

// AXIS: applied when the second axis die completes the pair.
export function applyAxis(s: GameState): void {
  const blue = s.slots['axis-blue']
  const orange = s.slots['axis-orange']
  if (!blue || !orange) return
  // Positive axis = tilt toward the Pilot (blue); negative = toward Co-Pilot.
  s.axis += blue.value - orange.value
  s.log.push(`Axis -> ${s.axis}`)
  if (Math.abs(s.axis) >= s.axisLimit) lose(s, 'spin')
}

// ENGINES: applied when the second engine die completes the pair.
export function applyEngines(s: GameState): void {
  const blue = s.slots['engine-blue']
  const orange = s.slots['engine-orange']
  if (!blue || !orange) return
  const speed = blue.value + orange.value
  s.log.push(`Engines -> speed ${speed}`)
  if (s.altitude === 0) {
    // Landing round: speed is the braking check, not aerodynamics.
    s.landingSpeed = speed
    // Allow exact arrival if still short of the airport.
    if (s.currentPosition < s.airportIndex) moveApproach(s, aeroAdvance(s, speed))
    return
  }
  moveApproach(s, aeroAdvance(s, speed))
}

// RADIO: remove one airplane from the space `value` ahead (current = 1).
export function applyRadio(s: GameState, value: number): void {
  const idx = s.currentPosition + value - 1
  if (idx <= s.airportIndex && s.approach[idx] && s.approach[idx].traffic > 0) {
    s.approach[idx].traffic -= 1
    s.log.push(`Radio: cleared traffic at space ${idx}`)
  }
}

// LANDING GEAR: flip switch, push blue aerodynamics marker +1.
export function applyGear(s: GameState, slotId: SlotId): void {
  s.switches.gear[getSlot(slotId).order] = true
  s.blueMarker += 1
}

// FLAPS: flip switch, push orange aerodynamics marker +1.
export function applyFlaps(s: GameState, slotId: SlotId): void {
  s.switches.flaps[getSlot(slotId).order] = true
  s.orangeMarker += 1
}

// BRAKES: flip switch, set brake strength by number deployed.
export function applyBrakes(s: GameState, slotId: SlotId): void {
  s.switches.brakes[getSlot(slotId).order] = true
  const deployed = s.switches.brakes.filter(Boolean).length
  s.brakeStrength = BRAKE_STRENGTHS[deployed]
}

// CONCENTRATION: generate one coffee (capped).
export function applyConcentration(s: GameState): void {
  if (s.coffee < 3) s.coffee += 1
}
