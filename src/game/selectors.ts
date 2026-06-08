// Pure read helpers: legality of moves and derived flags. No mutation.

import { MANDATORY_SLOTS, SLOTS, getSlot } from './slots'
import type { DieValue, GameState, Role, SlotId } from './types'

export function unplacedDice(s: GameState, role: Role) {
  return s.dice[role].filter((d) => !d.placed)
}

export function placedCount(s: GameState): number {
  return (
    s.dice.pilot.filter((d) => d.placed).length +
    s.dice.copilot.filter((d) => d.placed).length
  )
}

export function totalDice(s: GameState): number {
  return s.dice.pilot.length + s.dice.copilot.length
}

export function allDicePlaced(s: GameState): boolean {
  return totalDice(s) > 0 && placedCount(s) === totalDice(s)
}

// Sequential groups (flaps, brakes) must be deployed in ascending order. The
// switches persist across rounds (slots reset each round), so readiness is based
// on the deployed switch state, not the current round's slot occupancy.
export function isSequentialReady(s: GameState, slotId: SlotId): boolean {
  const def = getSlot(slotId)
  if (!def.sequential) return true
  const deployed = def.group === 'flaps' ? s.switches.flaps : s.switches.brakes
  for (let o = 0; o < def.order; o++) if (!deployed[o]) return false
  return true
}

// A gear/flaps/brakes switch can only be deployed once (its switch persists).
function isSwitchAvailable(s: GameState, slotId: SlotId): boolean {
  const def = getSlot(slotId)
  if (def.group === 'gear') return !s.switches.gear[def.order]
  if (def.group === 'flaps') return !s.switches.flaps[def.order]
  if (def.group === 'brakes') return !s.switches.brakes[def.order]
  return true
}

// Can `role` place a die showing `value` on `slotId` right now?
export function canPlace(
  s: GameState,
  role: Role,
  slotId: SlotId,
  value: DieValue,
): boolean {
  if (s.phase !== 'placement') return false
  const def = getSlot(slotId)
  if (s.slots[slotId] !== null) return false
  if (!def.colors.includes(role)) return false
  if (def.values !== null && !def.values.includes(value)) return false
  if (!isSwitchAvailable(s, slotId)) return false
  if (!isSequentialReady(s, slotId)) return false
  return true
}

// All slots where `role` could legally place a die showing `value`.
export function legalSlots(
  s: GameState,
  role: Role,
  value: DieValue,
): SlotId[] {
  return SLOTS.filter((def) => canPlace(s, role, def.id, value)).map(
    (def) => def.id,
  )
}

export function mandatoryFilled(s: GameState): boolean {
  return MANDATORY_SLOTS.every((id) => s.slots[id] !== null)
}

// Coffee can shift a die value within 1..6; which faces are reachable?
export function reachableValues(value: DieValue, coffee: number): DieValue[] {
  const out: DieValue[] = []
  for (let v = 1; v <= 6; v++) {
    if (Math.abs(v - value) <= coffee) out.push(v as DieValue)
  }
  return out
}
