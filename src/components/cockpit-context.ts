import { createContext, useContext } from 'react'
import type { DieValue, GameState, Role, SlotId } from '../game'

// Shared placement interaction state, provided by <Cockpit> and consumed by the
// slot / dice components so they stay presentational.
export interface CockpitApi {
  state: GameState
  // The role whose dice are currently revealed on screen (pass-and-play).
  viewer: Role
  selectedDieId: string | null
  pendingValue: DieValue | null
  coffeeSpent: number
  legalSlots: Set<SlotId>
  rerollMode: boolean
  rerollSelection: Set<string>
  selectDie: (dieId: string) => void
  adjust: (delta: 1 | -1) => void
  canAdjust: (delta: 1 | -1) => boolean
  place: (slotId: SlotId) => void
  toggleRerollMode: () => void
  toggleRerollDie: (dieId: string) => void
  confirmReroll: () => void
}

export const CockpitContext = createContext<CockpitApi | null>(null)

export function useCockpit(): CockpitApi {
  const ctx = useContext(CockpitContext)
  if (!ctx) throw new Error('useCockpit must be used inside <CockpitContext>')
  return ctx
}
