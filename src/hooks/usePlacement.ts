import { useEffect, useMemo, useState } from 'react'
import {
  canPlace,
  legalSlots as legalSlotsFor,
  type Action,
  type DieValue,
  type GameState,
  type Role,
  type SlotId,
} from '../game'
import type { CockpitApi } from '../components/cockpit-context'

// Owns the local placement UI state (selection, coffee preview, reroll mode,
// pass-and-play reveal) on top of the engine state.
export function usePlacement(
  state: GameState,
  dispatch: (a: Action) => void,
  localRole?: Role,
): { api: CockpitApi; needsHandoff: boolean; reveal: () => void; myTurn: boolean } {
  const online = localRole != null
  const myTurn = !online || state.currentPlayer === localRole
  const [viewer, setViewer] = useState<Role | null>(null)
  const [selectedDieId, setSelectedDieId] = useState<string | null>(null)
  const [pendingValue, setPendingValue] = useState<DieValue | null>(null)
  const [rerollMode, setRerollMode] = useState(false)
  const [rerollSelection, setRerollSelection] = useState<Set<string>>(new Set())

  function clearSelection() {
    setSelectedDieId(null)
    setPendingValue(null)
    setRerollMode(false)
    setRerollSelection(new Set())
  }

  useEffect(() => {
    if (state.phase !== 'placement') setViewer(null)
    clearSelection()
  }, [state.phase, state.currentPlayer, state.round])

  const selectedDie = useMemo(
    () => state.dice[state.currentPlayer].find((d) => d.id === selectedDieId) ?? null,
    [state, selectedDieId],
  )

  const coffeeSpent =
    selectedDie && pendingValue !== null ? Math.abs(pendingValue - selectedDie.value) : 0

  const legalSlots = useMemo<Set<SlotId>>(() => {
    if (pendingValue === null) return new Set()
    return new Set(legalSlotsFor(state, state.currentPlayer, pendingValue))
  }, [state, pendingValue])

  function canAdjust(delta: 1 | -1): boolean {
    if (!selectedDie || pendingValue === null) return false
    const nv = pendingValue + delta
    if (nv < 1 || nv > 6) return false
    return Math.abs(nv - selectedDie.value) <= state.coffee
  }

  const api: CockpitApi = {
    state,
    viewer: localRole ?? viewer ?? state.currentPlayer,
    selectedDieId,
    pendingValue,
    coffeeSpent,
    legalSlots,
    rerollMode,
    rerollSelection,
    selectDie: (id) => {
      if (rerollMode || !myTurn) return
      const die = state.dice[state.currentPlayer].find((d) => d.id === id && !d.placed)
      if (!die) return
      setSelectedDieId(id)
      setPendingValue(die.value)
    },
    adjust: (delta) => {
      if (canAdjust(delta) && pendingValue !== null) {
        setPendingValue((pendingValue + delta) as DieValue)
      }
    },
    canAdjust,
    place: (slotId) => {
      if (!myTurn || !selectedDie || pendingValue === null) return
      if (!canPlace(state, state.currentPlayer, slotId, pendingValue)) return
      dispatch({ type: 'PLACE_DIE', dieId: selectedDie.id, slotId, value: pendingValue })
      clearSelection()
    },
    toggleRerollMode: () => {
      if (!myTurn) return
      setRerollMode((m) => !m)
      setSelectedDieId(null)
      setPendingValue(null)
      setRerollSelection(new Set())
    },
    toggleRerollDie: (id) =>
      setRerollSelection((prev) => {
        const next = new Set(prev)
        next.has(id) ? next.delete(id) : next.add(id)
        return next
      }),
    confirmReroll: () => {
      dispatch({ type: 'USE_REROLL', dieIds: [...rerollSelection] })
      setRerollMode(false)
      setRerollSelection(new Set())
    },
  }

  return {
    api,
    // Online play has no device handoff: each player sees only their own dice.
    needsHandoff: !online && state.phase === 'placement' && viewer !== state.currentPlayer,
    reveal: () => setViewer(state.currentPlayer),
    myTurn,
  }
}
