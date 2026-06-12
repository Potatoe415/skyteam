// Per-player redacted view of the game state (framework-free, server-reusable).
// The server holds the full state; each client only ever receives the view for
// its own role. This models Sky Team's restricted-communication rule: you never
// see your partner's un-placed dice values (their intended move stays hidden).

import type { Die, GameState, Role } from './types'

const OTHER: Record<Role, Role> = { pilot: 'copilot', copilot: 'pilot' }

// Mask the value of a partner die that has not been placed yet. Placed dice are
// on the board and visible to both players, so they are never masked.
function maskDie(die: Die): Die {
  if (die.placed) return die
  return { ...die, value: 1, hidden: true }
}

// Build the state as seen by `viewer`: the partner's un-placed dice are masked.
export function redactStateFor(state: GameState, viewer: Role): GameState {
  const partner = OTHER[viewer]
  return {
    ...state,
    dice: {
      ...state.dice,
      [partner]: state.dice[partner].map(maskDie),
    },
  }
}
