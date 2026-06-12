// Shared data-access + view-building helpers for the game endpoints.

import type { SupabaseClient } from '@supabase/supabase-js'
import { redactStateFor, type GameState, type Role } from '../../src/game'
import { HttpError } from './auth'

export interface GameRow {
  id: string
  room_code: string
  status: string
  state: GameState
  version: number
  host_user_id: string | null
}

export interface PlayerRow {
  seat: number
  user_id: string | null
  display_name: string | null
  role: Role | null
  connected: boolean
}

const GAME_COLUMNS = 'id, room_code, status, state, version, host_user_id'
const PLAYER_COLUMNS = 'seat, user_id, display_name, role, connected'

export async function loadGame(
  supabase: SupabaseClient,
  gameId: string,
): Promise<GameRow> {
  const { data } = await supabase
    .from('games')
    .select(GAME_COLUMNS)
    .eq('id', gameId)
    .maybeSingle()
  if (!data) throw new HttpError(404, 'Game not found')
  return data as GameRow
}

export async function loadGameByCode(
  supabase: SupabaseClient,
  roomCode: string,
): Promise<GameRow> {
  const { data } = await supabase
    .from('games')
    .select(GAME_COLUMNS)
    .eq('room_code', roomCode)
    .maybeSingle()
  if (!data) throw new HttpError(404, 'Game not found')
  return data as GameRow
}

export async function loadPlayers(
  supabase: SupabaseClient,
  gameId: string,
): Promise<PlayerRow[]> {
  const { data } = await supabase
    .from('game_players')
    .select(PLAYER_COLUMNS)
    .eq('game_id', gameId)
    .order('seat')
  return (data ?? []) as PlayerRow[]
}

export function roleForUser(players: PlayerRow[], userId: string): Role | null {
  return players.find((p) => p.user_id === userId)?.role ?? null
}

// Persist a new state, bump version, and insert the realtime tick. Returns the
// new version. The tick carries no secret — clients refetch their view on it.
export async function persistTick(
  supabase: SupabaseClient,
  game: GameRow,
  state: GameState,
  status: string,
): Promise<number> {
  const version = game.version + 1
  const { error } = await supabase
    .from('games')
    .update({ state, version, status })
    .eq('id', game.id)
    .eq('version', game.version)
  if (error) throw new HttpError(409, 'Concurrent update, please retry')
  await supabase
    .from('game_events')
    .insert({ game_id: game.id, version })
  return version
}

export function buildView(
  game: GameRow,
  players: PlayerRow[],
  role: Role | null,
  isHost = false,
) {
  return {
    gameId: game.id,
    roomCode: game.room_code,
    status: game.status,
    version: game.version,
    myRole: role,
    isHost,
    players: players.map((p) => ({
      seat: p.seat,
      displayName: p.display_name,
      role: p.role,
      connected: p.connected,
    })),
    state: role ? redactStateFor(game.state, role) : null,
  }
}
