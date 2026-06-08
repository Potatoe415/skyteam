// Action-space (slot) definitions: who may place, which values, and ordering.

import type { DieValue, Role, SlotGroup, SlotId } from './types'

export interface SlotDef {
  id: SlotId
  colors: Role[] // roles allowed to place here
  values: DieValue[] | null // allowed face values; null = any
  group: SlotGroup
  mandatory: boolean
  // Position within a group. Used by sequential groups (flaps, brakes) which
  // must be filled in ascending order. Gear has order but is not sequential.
  order: number
  sequential: boolean
}

const def = (
  id: SlotId,
  colors: Role[],
  values: DieValue[] | null,
  group: SlotGroup,
  order: number,
  opts: { mandatory?: boolean; sequential?: boolean } = {},
): SlotDef => ({
  id,
  colors,
  values,
  group,
  order,
  mandatory: opts.mandatory ?? false,
  sequential: opts.sequential ?? false,
})

const PILOT: Role[] = ['pilot']
const COPILOT: Role[] = ['copilot']
const BOTH: Role[] = ['pilot', 'copilot']

export const SLOTS: SlotDef[] = [
  def('axis-blue', PILOT, null, 'axis', 0, { mandatory: true }),
  def('axis-orange', COPILOT, null, 'axis', 1, { mandatory: true }),

  def('engine-blue', PILOT, null, 'engine', 0, { mandatory: true }),
  def('engine-orange', COPILOT, null, 'engine', 1, { mandatory: true }),

  def('radio-blue', PILOT, null, 'radio', 0),
  def('radio-orange-1', COPILOT, null, 'radio', 1),
  def('radio-orange-2', COPILOT, null, 'radio', 2),

  def('gear-1', PILOT, [1, 2], 'gear', 0),
  def('gear-2', PILOT, [3, 4], 'gear', 1),
  def('gear-3', PILOT, [5, 6], 'gear', 2),

  def('flaps-1', COPILOT, [1, 2], 'flaps', 0, { sequential: true }),
  def('flaps-2', COPILOT, [2, 3], 'flaps', 1, { sequential: true }),
  def('flaps-3', COPILOT, [4, 5], 'flaps', 2, { sequential: true }),
  def('flaps-4', COPILOT, [5, 6], 'flaps', 3, { sequential: true }),

  def('brakes-1', PILOT, [2], 'brakes', 0, { sequential: true }),
  def('brakes-2', PILOT, [4], 'brakes', 1, { sequential: true }),
  def('brakes-3', PILOT, [6], 'brakes', 2, { sequential: true }),

  def('concentration-1', BOTH, null, 'concentration', 0),
  def('concentration-2', BOTH, null, 'concentration', 1),
  def('concentration-3', BOTH, null, 'concentration', 2),
]

const SLOT_BY_ID: Record<string, SlotDef> = Object.fromEntries(
  SLOTS.map((s) => [s.id, s]),
)

export function getSlot(id: SlotId): SlotDef {
  return SLOT_BY_ID[id]
}

export const MANDATORY_SLOTS: SlotId[] = SLOTS.filter((s) => s.mandatory).map(
  (s) => s.id,
)
