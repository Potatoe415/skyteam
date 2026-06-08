// Tunable game constants and the (approximate) YUL base approach track.
// Numbers marked "approx" are playable approximations of the physical YUL setup
// and are intentionally data-driven so they can be matched to the official
// component later (see docs/PRODUCT.md Open_Questions).

import type { ApproachSpace, Role } from './types'

export const TOTAL_ROUNDS = 7

// Reaching |axis| >= AXIS_LIMIT = spin out (loss).
export const AXIS_LIMIT = 5

// Altitude shown during each round (round 1 = 6000 ... round 7 = 0).
export function altitudeForRound(round: number): number {
  return (TOTAL_ROUNDS - round) * 1000
}

// Starting player per round (altitude track arrows). Pilot opens round 1,
// then alternates (approx).
export function startingPlayerForRound(round: number): Role {
  return round % 2 === 1 ? 'pilot' : 'copilot'
}

// Rounds that grant a reroll token at their start (2 reroll tokens total: the
// 6000 ft round and the 3000 ft round). (approx)
export const REROLL_ROUNDS = [1, 4]

// Aerodynamics markers.
export const BLUE_MARKER_START = 4.5 // between 4 and 5
export const ORANGE_MARKER_START = 8.5 // between 8 and 9

// Brake strength by number of brakes deployed (0..3). Deployed in order 2,4,6;
// the marker sits just past the deployed value. Final-round win needs
// speed < brakeStrength. With no brakes you cannot stop.
export const BRAKE_STRENGTHS = [1, 2.5, 4.5, 6.5]

export const MAX_COFFEE = 3

// YUL Montréal-Trudeau approach track (approx). Index 0 = starting Current
// Position; the last index is the airport. `traffic` = airplane tokens to clear.
// Tuned for an approachable v1: 6 spaces of approach (one advance per round) plus
// the airport, with three single airplanes that must each be cleared by Radio
// before the plane advances into them. Increase `traffic` values here to raise
// difficulty toward the full physical YUL track.
export function createYulApproach(): ApproachSpace[] {
  const traffic = [0, 1, 0, 1, 0, 1] // indices 0..5; airplanes at 1, 3, 5
  const spaces: ApproachSpace[] = traffic.map((t) => ({
    traffic: t,
    isAirport: false,
  }))
  spaces.push({ traffic: 0, isAirport: true }) // index 6 = airport
  return spaces
}
