import { describe, expect, it } from 'vitest'
import { createInitialState } from '../setup'
import { canPlace, legalSlots, reachableValues } from '../selectors'
import type { GameState } from '../types'

function placementState(): GameState {
  const s = createInitialState()
  s.phase = 'placement'
  s.rolled = true
  return s
}

describe('canPlace — colour and value constraints', () => {
  it('lets the pilot place any value on the axis', () => {
    const s = placementState()
    expect(canPlace(s, 'pilot', 'axis-blue', 5)).toBe(true)
  })

  it('blocks the pilot from a co-pilot (orange) slot', () => {
    const s = placementState()
    expect(canPlace(s, 'pilot', 'flaps-1', 1)).toBe(false)
    expect(canPlace(s, 'copilot', 'flaps-1', 1)).toBe(true)
  })

  it('enforces value constraints (brakes need a 2 first)', () => {
    const s = placementState()
    expect(canPlace(s, 'pilot', 'brakes-1', 2)).toBe(true)
    expect(canPlace(s, 'pilot', 'brakes-1', 4)).toBe(false)
  })

  it('blocks an occupied slot', () => {
    const s = placementState()
    s.slots['axis-blue'] = { owner: 'pilot', value: 3 }
    expect(canPlace(s, 'pilot', 'axis-blue', 4)).toBe(false)
  })

  it('rejects placement outside the placement phase', () => {
    const s = createInitialState() // phase 'setup'
    expect(canPlace(s, 'pilot', 'axis-blue', 3)).toBe(false)
  })
})

describe('sequential vs free ordering', () => {
  it('requires flaps in order, based on the deployed switch (not this round)', () => {
    const s = placementState()
    expect(canPlace(s, 'copilot', 'flaps-2', 2)).toBe(false)
    s.switches.flaps[0] = true // flaps-1 deployed in an earlier round
    expect(canPlace(s, 'copilot', 'flaps-2', 2)).toBe(true)
  })

  it('allows gear in any order', () => {
    const s = placementState()
    expect(canPlace(s, 'pilot', 'gear-2', 3)).toBe(true) // gear-1 empty, still ok
  })

  it('requires brakes in order, based on the deployed switch', () => {
    const s = placementState()
    expect(canPlace(s, 'pilot', 'brakes-2', 4)).toBe(false)
    s.switches.brakes[0] = true
    expect(canPlace(s, 'pilot', 'brakes-2', 4)).toBe(true)
  })

  it('blocks placing on an already-deployed switch', () => {
    const s = placementState()
    s.switches.gear[0] = true
    expect(canPlace(s, 'pilot', 'gear-1', 2)).toBe(false)
    s.switches.flaps[0] = true
    expect(canPlace(s, 'copilot', 'flaps-1', 1)).toBe(false)
  })
})

describe('legalSlots & reachableValues', () => {
  it('lists concentration and value-matching slots', () => {
    const s = placementState()
    const slots = legalSlots(s, 'pilot', 2)
    expect(slots).toContain('concentration-1')
    expect(slots).toContain('brakes-1') // value 2
    expect(slots).not.toContain('flaps-1') // orange only
  })

  it('computes coffee-reachable faces within 1..6', () => {
    expect(reachableValues(3, 1)).toEqual([2, 3, 4])
    expect(reachableValues(1, 2)).toEqual([1, 2, 3])
    expect(reachableValues(6, 1)).toEqual([5, 6])
  })
})
