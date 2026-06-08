import { useReducer } from 'react'
import { createInitialState, reducer } from '../game'

// Single source of game state for the app.
export function useGame() {
  return useReducer(reducer, undefined, createInitialState)
}
