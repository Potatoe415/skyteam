// Server-side authorization for online moves. Critical: the reducer always acts
// on `state.currentPlayer`, so without this guard a client could place the
// PARTNER's die by sending PLACE_DIE during the partner's turn. We require the
// actor's role to match currentPlayer for placement actions.

import type { Action, GameState, Role } from '../../src/game'
import { HttpError } from './auth'

export function assertActorMayAct(
  state: GameState,
  role: Role,
  action: Action,
): void {
  switch (action.type) {
    case 'PLACE_DIE':
    case 'USE_REROLL':
      if (state.phase !== 'placement' || state.currentPlayer !== role) {
        throw new HttpError(403, 'Not your turn to place dice')
      }
      return
    case 'ROLL_DICE':
      if (state.phase !== 'briefing') {
        throw new HttpError(409, 'Dice can only be rolled during briefing')
      }
      return
    case 'NEXT_ROUND':
      if (state.phase !== 'roundEnd') {
        throw new HttpError(409, 'Round is not over')
      }
      return
    case 'RESTART':
      return
    default:
      throw new HttpError(400, 'Unsupported action')
  }
}
