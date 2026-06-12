// Join an existing online game by room code. The joiner takes seat 1 (copilot
// by default). Re-joining (same user) is idempotent and returns the view.

import type { VercelRequest, VercelResponse } from '@vercel/node'
import { requireUserId, HttpError } from '../_lib/auth'
import { getServiceClient } from '../_lib/supabase'
import { isValidRoomCode } from '../_lib/rooms'
import { postJson, body } from '../_lib/http'
import { buildView, loadGameByCode, loadPlayers, roleForUser } from '../_lib/game'

export default postJson(async (req: VercelRequest, res: VercelResponse) => {
  const userId = await requireUserId(req)
  const { roomCode, displayName } = body<{ roomCode?: string; displayName?: string }>(req)
  const code = (roomCode ?? '').toUpperCase()
  if (!isValidRoomCode(code)) throw new HttpError(400, 'Invalid room code')

  const supabase = getServiceClient()
  const game = await loadGameByCode(supabase, code)
  let players = await loadPlayers(supabase, game.id)

  const existing = roleForUser(players, userId)
  if (!existing) {
    if (players.some((p) => p.user_id === userId)) {
      // already seated without a role (shouldn't happen) -> fall through
    } else {
      if (players.length >= 2) throw new HttpError(409, 'Game is full')
      if (game.status !== 'lobby') throw new HttpError(409, 'Game already started')
      await supabase.from('game_players').insert({
        game_id: game.id,
        seat: 1,
        user_id: userId,
        display_name: (displayName ?? '').slice(0, 24) || 'Player 2',
        role: 'copilot',
      })
      await supabase.from('game_events').insert({ game_id: game.id, version: game.version })
      players = await loadPlayers(supabase, game.id)
    }
  }

  const role = roleForUser(players, userId)
  res.status(200).json(buildView(game, players, role, game.host_user_id === userId))
})
