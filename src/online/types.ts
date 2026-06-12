// Shape of the redacted view returned by the server actions (see api/_lib/game).

import type { GameState, Role } from '../game'

export type GameStatus = 'lobby' | 'playing' | 'finished'

export interface LobbyPlayer {
  seat: number
  displayName: string | null
  role: Role | null
  connected: boolean
}

export interface GameView {
  gameId: string
  roomCode: string
  status: GameStatus
  version: number
  myRole: Role | null
  isHost: boolean
  players: LobbyPlayer[]
  state: GameState | null
}
