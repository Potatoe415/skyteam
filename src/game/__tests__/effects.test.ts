import { describe, expect, it } from 'vitest'
import { createInitialState } from '../setup'
import {
  aeroAdvance,
  applyAxis,
  applyBrakes,
  applyConcentration,
  applyEngines,
  applyFlaps,
  applyGear,
  applyRadio,
  moveApproach,
} from '../effects'
import type { GameState } from '../types'

function clearTraffic(s: GameState): void {
  s.approach = s.approach.map((sp) => ({ ...sp, traffic: 0 }))
}

describe('axis', () => {
  it('tilts toward the higher die by the difference', () => {
    const s = createInitialState()
    s.slots['axis-blue'] = { owner: 'pilot', value: 5 }
    s.slots['axis-orange'] = { owner: 'copilot', value: 3 }
    applyAxis(s)
    expect(s.axis).toBe(2) // toward pilot
    expect(s.result).toBeNull()
  })

  it('does not move when dice are equal', () => {
    const s = createInitialState()
    s.slots['axis-blue'] = { owner: 'pilot', value: 4 }
    s.slots['axis-orange'] = { owner: 'copilot', value: 4 }
    applyAxis(s)
    expect(s.axis).toBe(0)
  })

  it('spins out (loss) at the axis limit', () => {
    const s = createInitialState()
    s.slots['axis-blue'] = { owner: 'pilot', value: 6 }
    s.slots['axis-orange'] = { owner: 'copilot', value: 1 }
    applyAxis(s) // delta 5 >= AXIS_LIMIT(5)
    expect(s.result).toBe('lost')
    expect(s.phase).toBe('lost')
  })
})

describe('engines / aerodynamics', () => {
  it('maps speed to advance steps via the markers', () => {
    const s = createInitialState() // blue 4.5, orange 8.5
    expect(aeroAdvance(s, 4)).toBe(0)
    expect(aeroAdvance(s, 5)).toBe(1)
    expect(aeroAdvance(s, 8)).toBe(1)
    expect(aeroAdvance(s, 9)).toBe(2)
  })

  it('advances the approach track on engine resolution', () => {
    const s = createInitialState()
    clearTraffic(s)
    s.slots['engine-blue'] = { owner: 'pilot', value: 4 }
    s.slots['engine-orange'] = { owner: 'copilot', value: 1 } // speed 5 -> +1
    applyEngines(s)
    expect(s.currentPosition).toBe(1)
    expect(s.result).toBeNull()
  })

  it('collides when advancing into traffic', () => {
    const s = createInitialState() // space 1 has traffic
    s.slots['engine-blue'] = { owner: 'pilot', value: 4 }
    s.slots['engine-orange'] = { owner: 'copilot', value: 1 } // speed 5 -> +1
    applyEngines(s)
    expect(s.result).toBe('lost')
    expect(s.lossReason).toBe('collision')
  })

  it('overshoots when forced to move at the airport', () => {
    const s = createInitialState()
    s.currentPosition = s.airportIndex
    s.slots['engine-blue'] = { owner: 'pilot', value: 4 }
    s.slots['engine-orange'] = { owner: 'copilot', value: 4 } // speed 8 -> +1
    applyEngines(s)
    expect(s.result).toBe('lost')
    expect(s.lossReason).toBe('overshoot')
  })

  it('records landing speed without moving on the final round', () => {
    const s = createInitialState()
    s.altitude = 0
    s.currentPosition = s.airportIndex
    s.slots['engine-blue'] = { owner: 'pilot', value: 2 }
    s.slots['engine-orange'] = { owner: 'copilot', value: 1 }
    applyEngines(s)
    expect(s.landingSpeed).toBe(3)
    expect(s.currentPosition).toBe(s.airportIndex)
    expect(s.result).toBeNull()
  })
})

describe('moveApproach guards', () => {
  it('does nothing for zero advance', () => {
    const s = createInitialState()
    moveApproach(s, 0)
    expect(s.currentPosition).toBe(0)
  })
})

describe('radio', () => {
  it('removes traffic from the space value-ahead (current = 1)', () => {
    const s = createInitialState() // space 1 traffic 1, space 2 traffic 2
    applyRadio(s, 2) // idx 0 + 2 - 1 = 1
    expect(s.approach[1].traffic).toBe(0)
  })

  it('has no effect when the target space is clear', () => {
    const s = createInitialState()
    applyRadio(s, 1) // idx 0, traffic already 0
    expect(s.approach[0].traffic).toBe(0)
    expect(s.result).toBeNull()
  })
})

describe('configuration switches', () => {
  it('gear pushes the blue marker', () => {
    const s = createInitialState()
    applyGear(s, 'gear-1')
    expect(s.switches.gear[0]).toBe(true)
    expect(s.blueMarker).toBe(5.5)
  })

  it('flaps push the orange marker', () => {
    const s = createInitialState()
    applyFlaps(s, 'flaps-1')
    expect(s.switches.flaps[0]).toBe(true)
    expect(s.orangeMarker).toBe(9.5)
  })

  it('brakes set strength by number deployed', () => {
    const s = createInitialState()
    applyBrakes(s, 'brakes-1')
    expect(s.switches.brakes[0]).toBe(true)
    expect(s.brakeStrength).toBe(2.5)
  })

  it('concentration generates coffee up to the cap', () => {
    const s = createInitialState()
    applyConcentration(s)
    applyConcentration(s)
    applyConcentration(s)
    applyConcentration(s) // 4th capped
    expect(s.coffee).toBe(3)
  })
})
