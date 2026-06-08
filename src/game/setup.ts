// Initial state and per-round setup (rolling dice, resetting slots).

import {
  altitudeForRound,
  BLUE_MARKER_START,
  createYulApproach,
  ORANGE_MARKER_START,
  REROLL_ROUNDS,
  startingPlayerForRound,
  AXIS_LIMIT,
} from './config'
import { SLOTS } from './slots'
import type { Die, DieValue, GameState, Role, SlotId, SlotMap } from './types'

function randomValue(): DieValue {
  return (Math.floor(Math.random() * 6) + 1) as DieValue
}

export function createDice(owner: Role, values?: DieValue[]): Die[] {
  return Array.from({ length: 4 }, (_, i) => ({
    id: `${owner}-${i}`,
    owner,
    value: values ? values[i] : randomValue(),
    placed: false,
  }))
}

export function emptySlots(): SlotMap {
  const map = {} as SlotMap
  for (const slot of SLOTS) map[slot.id] = null
  return map
}

export function createInitialState(): GameState {
  const approach = createYulApproach()
  return {
    phase: 'setup',
    round: 1,
    altitude: altitudeForRound(1),
    startingPlayer: startingPlayerForRound(1),
    currentPlayer: startingPlayerForRound(1),
    dice: { pilot: [], copilot: [] },
    rolled: false,
    approach,
    currentPosition: 0,
    airportIndex: approach.length - 1,
    axis: 0,
    axisLimit: AXIS_LIMIT,
    blueMarker: BLUE_MARKER_START,
    orangeMarker: ORANGE_MARKER_START,
    brakeStrength: 1,
    switches: {
      gear: [false, false, false],
      flaps: [false, false, false, false],
      brakes: [false, false, false],
    },
    coffee: 0,
    rerolls: 0,
    slots: emptySlots(),
    landingSpeed: null,
    result: null,
    lossReason: null,
    log: [],
  }
}

// Roll fresh dice for both players and enter the silent placement phase.
export function rollDiceInto(
  s: GameState,
  values?: { pilot: DieValue[]; copilot: DieValue[] },
): void {
  s.dice.pilot = createDice('pilot', values?.pilot)
  s.dice.copilot = createDice('copilot', values?.copilot)
  s.rolled = true
  s.phase = 'placement'
  s.currentPlayer = s.startingPlayer
  s.log.push(`Round ${s.round}: dice rolled — silence begins.`)
}

// Advance to the next round: descend, return dice, clear slots (effects persist).
export function startNextRound(s: GameState): void {
  s.round += 1
  s.altitude = altitudeForRound(s.round)
  s.startingPlayer = startingPlayerForRound(s.round)
  s.currentPlayer = s.startingPlayer
  s.dice = { pilot: [], copilot: [] }
  s.rolled = false
  s.slots = emptySlots()
  s.phase = 'briefing'
  if (REROLL_ROUNDS.includes(s.round)) s.rerolls += 1
}

export function unplacedDieIds(s: GameState, role: Role): SlotId[] {
  return s.dice[role].filter((d) => !d.placed).map((d) => d.id) as SlotId[]
}
