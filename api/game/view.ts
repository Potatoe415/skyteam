// Fetch the caller's redacted view of a game. Called on load and on every
// realtime tick. Never returns the partner's hidden dice.

import type { VercelRequest, VercelResponse } from '@vercel/node'
import { requireUserId, HttpError } from '../_lib/auth'
import { getServiceClient } from '../_lib/supabase'
import { postJson, body } from '../_lib/http'
import { buildView, loadGame, loadPlayers, roleForUser } from '../_lib/game'

export default postJson(async (req: VercelRequest, res: VercelResponse) => {
  const userId = await requireUserId(req)
  const { gameId } = body<{ gameId?: string }>(req)
  if (!gameId) throw new HttpError(400, 'Missing gameId')

  const supabase = getServiceClient()
  const game = await loadGame(supabase, gameId)
  const players = await loadPlayers(supabase, gameId)
  const role = roleForUser(players, userId)
  res.status(200).json(buildView(game, players, role, game.host_user_id === userId))
})
