// Canonical, framework-free types for the Sky Team game state.
// This file is the executable source of truth (see docs/DATA_MODEL.md).

export type Role = 'pilot' | 'copilot'

// Stable, locale-neutral codes. The UI maps these to translated strings; the
// engine never produces user-facing text (see src/i18n).
export type LossReason =
  | 'spin'
  | 'collision'
  | 'overshoot'
  | 'mandatory'
  | 'notReached'
  | 'landing'

export type LandingCheckKey = 'traffic' | 'gear' | 'flaps' | 'axis' | 'speed'

export type Phase =
  | 'setup' // choosing roles
  | 'briefing' // strategy talk, dice not yet rolled
  | 'placement' // silent dice placement (turn-based)
  | 'roundEnd' // round resolved, waiting to continue
  | 'won'
  | 'lost'

export type DieValue = 1 | 2 | 3 | 4 | 5 | 6

export interface Die {
  id: string
  owner: Role
  value: DieValue
  placed: boolean
  // Online only: true when this die belongs to the partner and is not yet
  // placed, so its value is masked in the per-player redacted view.
  hidden?: boolean
}

export interface ApproachSpace {
  traffic: number
  isAirport: boolean
}

export type SlotGroup =
  | 'axis'
  | 'engine'
  | 'radio'
  | 'gear'
  | 'flaps'
  | 'brakes'
  | 'concentration'

export type SlotId =
  | 'axis-blue'
  | 'axis-orange'
  | 'engine-blue'
  | 'engine-orange'
  | 'radio-blue'
  | 'radio-orange-1'
  | 'radio-orange-2'
  | 'gear-1'
  | 'gear-2'
  | 'gear-3'
  | 'flaps-1'
  | 'flaps-2'
  | 'flaps-3'
  | 'flaps-4'
  | 'brakes-1'
  | 'brakes-2'
  | 'brakes-3'
  | 'concentration-1'
  | 'concentration-2'
  | 'concentration-3'

export interface PlacedDie {
  owner: Role
  value: DieValue
}

export type SlotMap = Record<SlotId, PlacedDie | null>

export interface Switches {
  gear: boolean[] // length 3
  flaps: boolean[] // length 4
  brakes: boolean[] // length 3
}

export interface GameState {
  phase: Phase
  round: number // 1..7
  altitude: number // 6000 down to 0
  startingPlayer: Role
  currentPlayer: Role
  dice: Record<Role, Die[]>
  rolled: boolean // dice rolled this round => silence
  approach: ApproachSpace[]
  currentPosition: number
  airportIndex: number
  axis: number // 0 = level; sign = tilt side
  axisLimit: number // reaching +/- this = spin out (loss)
  blueMarker: number // gear aerodynamics threshold (starts 4.5)
  orangeMarker: number // flaps aerodynamics threshold (starts 8.5)
  brakeStrength: number // landing brake strength (starts 1)
  switches: Switches
  coffee: number // 0..3
  rerolls: number // available reroll tokens
  slots: SlotMap
  landingSpeed: number | null // engine sum recorded on the landing round
  result: 'won' | 'lost' | null
  lossReason: LossReason | null // locale-neutral code; UI translates it
  log: string[]
}
