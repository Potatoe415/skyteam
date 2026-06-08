import { describe, expect, it } from 'vitest'
import { reducer, landingChecks, type Action } from '../reducer'
import { createDice, createInitialState } from '../setup'
import type { DieValue, GameState } from '../types'

function run(state: GameState, actions: Action[]): GameState {
  return actions.reduce((s, a) => reducer(s, a), state)
}

function placement(
  pilot: DieValue[],
  copilot: DieValue[],
  overrides: Partial<GameState> = {},
): GameState {
  const s = createInitialState()
  s.phase = 'placement'
  s.rolled = true
  s.currentPlayer = 'pilot'
  s.dice = { pilot: createDice('pilot', pilot), copilot: createDice('copilot', copilot) }
  return { ...s, ...overrides }
}

describe('game start & roll', () => {
  it('grants the round-1 reroll token and enters briefing', () => {
    const s = reducer(createInitialState(), { type: 'START_GAME' })
    expect(s.phase).toBe('briefing')
    expect(s.rerolls).toBe(1)
  })

  it('rolls fixed dice and begins silent placement with the starting player', () => {
    const s = run(createInitialState(), [
      { type: 'START_GAME' },
      { type: 'ROLL_DICE', values: { pilot: [1, 2, 3, 4], copilot: [4, 3, 2, 1] } },
    ])
    expect(s.phase).toBe('placement')
    expect(s.rolled).toBe(true)
    expect(s.currentPlayer).toBe('pilot')
    expect(s.dice.pilot.map((d) => d.value)).toEqual([1, 2, 3, 4])
  })
})

describe('a full round resolves to roundEnd', () => {
  it('places all 8 dice with mandatory slots filled', () => {
    let s = placement([3, 1, 6, 6], [3, 2, 6, 6])
    s = run(s, [
      { type: 'PLACE_DIE', dieId: 'pilot-0', slotId: 'axis-blue', value: 3 },
      { type: 'PLACE_DIE', dieId: 'copilot-0', slotId: 'axis-orange', value: 3 },
      { type: 'PLACE_DIE', dieId: 'pilot-1', slotId: 'engine-blue', value: 1 },
      { type: 'PLACE_DIE', dieId: 'copilot-1', slotId: 'engine-orange', value: 2 },
      { type: 'PLACE_DIE', dieId: 'pilot-2', slotId: 'concentration-1', value: 6 },
      { type: 'PLACE_DIE', dieId: 'copilot-2', slotId: 'concentration-2', value: 6 },
      { type: 'PLACE_DIE', dieId: 'pilot-3', slotId: 'radio-blue', value: 6 },
      { type: 'PLACE_DIE', dieId: 'copilot-3', slotId: 'radio-orange-1', value: 6 },
    ])
    expect(s.phase).toBe('roundEnd')
    expect(s.axis).toBe(0)
    expect(s.currentPosition).toBe(0) // speed 3 -> advance 0
    expect(s.coffee).toBe(2)
  })

  it('turn alternates between players', () => {
    let s = placement([3, 1, 6, 6], [3, 2, 6, 6])
    s = reducer(s, { type: 'PLACE_DIE', dieId: 'pilot-0', slotId: 'axis-blue', value: 3 })
    expect(s.currentPlayer).toBe('copilot')
  })
})

describe('coffee modifiers', () => {
  it('spends coffee to reach a constrained value', () => {
    let s = placement([3, 1, 1, 1], [1, 1, 1, 1], { coffee: 2 })
    s = reducer(s, { type: 'PLACE_DIE', dieId: 'pilot-0', slotId: 'brakes-1', value: 2 })
    expect(s.slots['brakes-1']).toEqual({ owner: 'pilot', value: 2 })
    expect(s.coffee).toBe(1) // cost |2-3| = 1
    expect(s.brakeStrength).toBe(2.5)
  })

  it('rejects a placement that needs more coffee than available', () => {
    let s = placement([3, 1, 1, 1], [1, 1, 1, 1], { coffee: 0 })
    s = reducer(s, { type: 'PLACE_DIE', dieId: 'pilot-0', slotId: 'brakes-1', value: 2 })
    expect(s.slots['brakes-1']).toBeNull()
    expect(s.dice.pilot[0].placed).toBe(false)
    expect(s.brakeStrength).toBe(1)
  })
})

describe('reroll tokens', () => {
  it('spends one token when rerolling unplaced dice', () => {
    let s = placement([1, 1, 1, 1], [1, 1, 1, 1], { rerolls: 1 })
    s = reducer(s, { type: 'USE_REROLL', dieIds: ['pilot-0', 'pilot-1'] })
    expect(s.rerolls).toBe(0)
  })

  it('does nothing with no tokens', () => {
    let s = placement([1, 1, 1, 1], [1, 1, 1, 1], { rerolls: 0 })
    s = reducer(s, { type: 'USE_REROLL', dieIds: ['pilot-0'] })
    expect(s.rerolls).toBe(0)
  })
})

describe('landing checks', () => {
  function winnable(): GameState {
    const s = createInitialState()
    s.approach = s.approach.map((sp) => ({ ...sp, traffic: 0 }))
    s.switches = { gear: [true, true, true], flaps: [true, true, true, true], brakes: [true, false, false] }
    s.axis = 0
    s.landingSpeed = 2
    s.brakeStrength = 2.5
    return s
  }

  it('passes all conditions for a clean landing', () => {
    const checks = landingChecks(winnable())
    expect(Object.values(checks).every(Boolean)).toBe(true)
  })

  it('fails when the plane is not level', () => {
    const s = winnable()
    s.axis = 1
    expect(landingChecks(s).axis).toBe(false)
  })

  it('fails when speed is not below the brakes', () => {
    const s = winnable()
    s.landingSpeed = 3
    s.brakeStrength = 2.5
    expect(landingChecks(s).speed).toBe(false)
  })
})
