// Live online game: subscribe to realtime ticks and refetch the redacted view.
// The view is the only state the client ever holds; moves go through the server.

import { useCallback, useEffect, useState } from 'react'
import type { Action } from '../game'
import { fetchView, sendMove } from './api'
import { getSupabase } from './supabaseClient'
import type { GameView } from './types'

export interface OnlineGame {
  view: GameView | null
  error: string | null
  dispatch: (action: Action) => void
  refresh: () => void
  applyView: (view: GameView) => void
}

export function useOnlineGame(gameId: string, initial: GameView | null): OnlineGame {
  const [view, setView] = useState<GameView | null>(initial)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(() => {
    fetchView(gameId)
      .then(setView)
      .catch((e: Error) => setError(e.message))
  }, [gameId])

  useEffect(() => {
    refresh()
    const supabase = getSupabase()
    const channel = supabase
      .channel(`game:${gameId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'game_events',
          filter: `game_id=eq.${gameId}`,
        },
        () => refresh(),
      )
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
  }, [gameId, refresh])

  const dispatch = useCallback(
    (action: Action) => {
      setError(null)
      sendMove(gameId, action)
        .then(setView)
        .catch((e: Error) => {
          setError(e.message)
          refresh()
        })
    },
    [gameId, refresh],
  )

  return { view, error, dispatch, refresh, applyView: setView }
}
