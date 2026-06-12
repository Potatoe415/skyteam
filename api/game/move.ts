// Apply a player's move authoritatively: validate, run the pure reducer, persist
// the new state, bump version, and emit a realtime tick. Randomness (rolls,
// rerolls) happens here on the server, never trusting client-supplied values.

import type { VercelRequest, VercelResponse } from '@vercel/node'
import { reducer, createInitialState, type Action, type GameState } from '../../src/game'
import { requireUserId, HttpError } from '../_lib/auth'
import { getServiceClient } from '../_lib/supabase'
import { postJson, body } from '../_lib/http'
import { assertActorMayAct } from '../_lib/guards'
import { buildView, loadGame, loadPlayers, roleForUser, persistTick } from '../_lib/game'

// Compute the next state. RESTART goes straight back to briefing (roles live in
// game_players, not in state, so the seats are preserved). ROLL_DICE ignores any
// client-supplied values so the roll happens server-side.
function nextState(current: GameState, action: Action): GameState {
  if (action.type === 'RESTART') {
    return reducer(createInitialState(), { type: 'START_GAME' })
  }
  if (action.type === 'ROLL_DICE') return reducer(current, { type: 'ROLL_DICE' })
  return reducer(current, action)
}

export default postJson(async (req: VercelRequest, res: VercelResponse) => {
  const userId = await requireUserId(req)
  const { gameId, action } = body<{ gameId?: string; action?: Action }>(req)
  if (!gameId || !action) throw new HttpError(400, 'Missing gameId or action')

  const supabase = getServiceClient()
  const game = await loadGame(supabase, gameId)
  const players = await loadPlayers(supabase, gameId)
  const role = roleForUser(players, userId)
  if (!role) throw new HttpError(403, 'You are not a player in this game')

  assertActorMayAct(game.state, role, action)
  const state = nextState(game.state, action)
  const status = state.phase === 'won' || state.phase === 'lost' ? 'finished' : 'playing'
  const version = await persistTick(supabase, game, state, status)

  const isHost = game.host_user_id === userId
  res.status(200).json(buildView({ ...game, state, version, status }, players, role, isHost))
})
