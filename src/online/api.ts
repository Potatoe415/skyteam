// Thin fetch wrappers around the server actions. Every call carries the user's
// anonymous access token; the server maps it to a seat/role.

import type { Action } from '../game'
import { ensureSignedIn } from './supabaseClient'
import type { GameView } from './types'

async function post<T>(action: string, payload: unknown): Promise<T> {
  const token = await ensureSignedIn()
  const res = await fetch(`/api/game/${action}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    const data = (await res.json().catch(() => ({}))) as { error?: string }
    throw new Error(data.error ?? `Request failed (${res.status})`)
  }
  return res.json() as Promise<T>
}

export const createGame = (displayName: string) =>
  post<GameView>('create', { displayName })

export const joinGame = (roomCode: string, displayName: string) =>
  post<GameView>('join', { roomCode, displayName })

export const startGame = (gameId: string, hostRole: 'pilot' | 'copilot') =>
  post<GameView>('start', { gameId, hostRole })

export const fetchView = (gameId: string) => post<GameView>('view', { gameId })

export const sendMove = (gameId: string, action: Action) =>
  post<GameView>('move', { gameId, action })
