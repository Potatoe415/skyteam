// Create a new online Sky Team game. The creator takes seat 0 (host, pilot by
// default) and the full initial state is stored server-side.

import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createInitialState } from '../../src/game'
import { requireUserId, HttpError } from '../_lib/auth'
import { getServiceClient } from '../_lib/supabase'
import { uniqueRoomCode } from '../_lib/rooms'
import { postJson, body } from '../_lib/http'
import { buildView, loadPlayers } from '../_lib/game'

export default postJson(async (req: VercelRequest, res: VercelResponse) => {
  const userId = await requireUserId(req)
  const { displayName } = body<{ displayName?: string }>(req)
  const supabase = getServiceClient()

  const roomCode = await uniqueRoomCode(supabase)
  const { data: game, error } = await supabase
    .from('games')
    .insert({
      room_code: roomCode,
      game_type: 'skyteam',
      status: 'lobby',
      state: createInitialState(),
      version: 0,
      host_user_id: userId,
    })
    .select('id, room_code, status, state, version, host_user_id')
    .single()
  if (error || !game) throw new HttpError(500, 'Could not create game')

  await supabase.from('game_players').insert({
    game_id: game.id,
    seat: 0,
    user_id: userId,
    display_name: (displayName ?? '').slice(0, 24) || 'Player 1',
    role: 'pilot',
  })

  const players = await loadPlayers(supabase, game.id)
  res.status(200).json(buildView(game as never, players, 'pilot', true))
})
