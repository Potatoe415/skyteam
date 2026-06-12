// Host starts the game: assign seat roles, then enter the briefing phase.

import type { VercelRequest, VercelResponse } from '@vercel/node'
import { reducer, type Role } from '../../src/game'
import { requireUserId, HttpError } from '../_lib/auth'
import { getServiceClient } from '../_lib/supabase'
import { postJson, body } from '../_lib/http'
import { buildView, loadGame, loadPlayers, roleForUser, persistTick } from '../_lib/game'

const OTHER: Record<Role, Role> = { pilot: 'copilot', copilot: 'pilot' }

export default postJson(async (req: VercelRequest, res: VercelResponse) => {
  const userId = await requireUserId(req)
  const { gameId, hostRole } = body<{ gameId?: string; hostRole?: Role }>(req)
  if (!gameId) throw new HttpError(400, 'Missing gameId')
  const role: Role = hostRole === 'copilot' ? 'copilot' : 'pilot'

  const supabase = getServiceClient()
  const game = await loadGame(supabase, gameId)
  if (game.host_user_id !== userId) throw new HttpError(403, 'Only the host can start')
  if (game.status !== 'lobby') throw new HttpError(409, 'Game already started')

  const players = await loadPlayers(supabase, gameId)
  if (players.length < 2) throw new HttpError(409, 'Waiting for a second player')

  for (const p of players) {
    if (!p.user_id) continue
    const assigned = p.user_id === userId ? role : OTHER[role]
    await supabase
      .from('game_players')
      .update({ role: assigned })
      .eq('game_id', gameId)
      .eq('seat', p.seat)
  }

  const state = reducer(game.state, { type: 'START_GAME' })
  const version = await persistTick(supabase, game, state, 'playing')

  const fresh = await loadPlayers(supabase, gameId)
  const myRole = roleForUser(fresh, userId)
  res
    .status(200)
    .json(buildView({ ...game, state, version, status: 'playing' }, fresh, myRole, true))
})
