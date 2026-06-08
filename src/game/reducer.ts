// The game reducer: the single source of truth for state transitions.
// Each action clones state (structuredClone) then mutates the draft.

import {
  applyAxis,
  applyBrakes,
  applyConcentration,
  applyEngines,
  applyFlaps,
  applyGear,
  applyRadio,
  lose,
} from './effects'
import { REROLL_ROUNDS, TOTAL_ROUNDS } from './config'
import { createInitialState, rollDiceInto, startNextRound } from './setup'
import { allDicePlaced, canPlace, mandatoryFilled } from './selectors'
import { getSlot } from './slots'
import type {
  DieValue,
  GameState,
  LandingCheckKey,
  Role,
  SlotId,
} from './types'

export type Action =
  | { type: 'START_GAME' }
  | { type: 'ROLL_DICE'; values?: { pilot: DieValue[]; copilot: DieValue[] } }
  | { type: 'PLACE_DIE'; dieId: string; slotId: SlotId; value: DieValue }
  | { type: 'USE_REROLL'; dieIds: string[] }
  | { type: 'NEXT_ROUND' }
  | { type: 'RESTART' }

export function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'RESTART':
      return createInitialState()
    case 'START_GAME':
      return startGame(state)
    case 'ROLL_DICE':
      return withDraft(state, (s) => {
        if (s.phase === 'briefing') rollDiceInto(s, action.values)
      })
    case 'USE_REROLL':
      return withDraft(state, (s) => useReroll(s, action.dieIds))
    case 'PLACE_DIE':
      return withDraft(state, (s) =>
        placeDie(s, action.dieId, action.slotId, action.value),
      )
    case 'NEXT_ROUND':
      return withDraft(state, (s) => {
        if (s.phase === 'roundEnd') startNextRound(s)
      })
    default:
      return state
  }
}

function withDraft(state: GameState, fn: (s: GameState) => void): GameState {
  const draft = structuredClone(state)
  fn(draft)
  return draft
}

function startGame(state: GameState): GameState {
  const s = structuredClone(state)
  s.phase = 'briefing'
  if (REROLL_ROUNDS.includes(s.round)) s.rerolls += 1
  return s
}

function useReroll(s: GameState, dieIds: string[]): void {
  if (s.phase !== 'placement' || s.rerolls <= 0) return
  let rerolled = false
  for (const role of ['pilot', 'copilot'] as Role[]) {
    for (const die of s.dice[role]) {
      if (!die.placed && dieIds.includes(die.id)) {
        die.value = (Math.floor(Math.random() * 6) + 1) as DieValue
        rerolled = true
      }
    }
  }
  if (rerolled) {
    s.rerolls -= 1
    s.log.push('Reroll token spent.')
  }
}

function placeDie(
  s: GameState,
  dieId: string,
  slotId: SlotId,
  value: DieValue,
): void {
  if (s.phase !== 'placement') return
  const die = s.dice[s.currentPlayer].find((d) => d.id === dieId)
  if (!die || die.placed) return
  const cost = Math.abs(value - die.value)
  if (cost > s.coffee) return
  if (value < 1 || value > 6) return
  if (!canPlace(s, s.currentPlayer, slotId, value)) return

  die.placed = true
  s.coffee -= cost
  s.slots[slotId] = { owner: s.currentPlayer, value }
  applyEffect(s, slotId, value)

  if (s.result) return
  advanceTurnOrResolve(s)
}

// Trigger the immediate effect of placing into `slotId`.
function applyEffect(s: GameState, slotId: SlotId, value: DieValue): void {
  const group = getSlot(slotId).group
  switch (group) {
    case 'axis':
      if (bothFilled(s, 'axis-blue', 'axis-orange')) applyAxis(s)
      break
    case 'engine':
      if (bothFilled(s, 'engine-blue', 'engine-orange')) applyEngines(s)
      break
    case 'radio':
      applyRadio(s, value)
      break
    case 'gear':
      applyGear(s, slotId)
      break
    case 'flaps':
      applyFlaps(s, slotId)
      break
    case 'brakes':
      applyBrakes(s, slotId)
      break
    case 'concentration':
      applyConcentration(s)
      break
  }
}

function bothFilled(s: GameState, a: SlotId, b: SlotId): boolean {
  return s.slots[a] !== null && s.slots[b] !== null
}

function advanceTurnOrResolve(s: GameState): void {
  const other: Role = s.currentPlayer === 'pilot' ? 'copilot' : 'pilot'
  const otherHas = s.dice[other].some((d) => !d.placed)
  const currentHas = s.dice[s.currentPlayer].some((d) => !d.placed)
  if (otherHas) {
    s.currentPlayer = other
  } else if (!currentHas) {
    resolveRoundEnd(s)
  }
  // else: other is empty but current still has dice -> current keeps placing.
}

function resolveRoundEnd(s: GameState): void {
  if (s.result) return
  if (!mandatoryFilled(s)) {
    lose(s, 'mandatory')
    return
  }
  if (s.round >= TOTAL_ROUNDS) {
    evaluateLanding(s)
  } else {
    s.phase = 'roundEnd'
  }
}

function evaluateLanding(s: GameState): void {
  if (s.currentPosition !== s.airportIndex) {
    lose(s, 'notReached')
    return
  }
  const checks = landingChecks(s)
  const allOk = Object.values(checks).every(Boolean)
  if (allOk) {
    s.result = 'won'
    s.phase = 'won'
    s.log.push('Victory! The passengers applaud.')
  } else {
    lose(s, 'landing')
  }
}

// Final-round conditions, keyed by locale-neutral codes (UI translates them).
export function landingChecks(s: GameState): Record<LandingCheckKey, boolean> {
  return {
    traffic: s.approach.every((sp) => sp.traffic === 0),
    gear: s.switches.gear.every(Boolean),
    flaps: s.switches.flaps.every(Boolean),
    axis: s.axis === 0,
    speed: s.landingSpeed !== null && s.landingSpeed < s.brakeStrength,
  }
}

export { allDicePlaced }
