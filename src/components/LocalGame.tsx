import { useGame } from '../hooks/useGame'
import { Cockpit } from './Cockpit'
import { StartScreen } from './StartScreen'

// Local pass-and-play session: the existing in-memory engine, unchanged.
export function LocalGame({ onExit }: { onExit: () => void }) {
  const [state, dispatch] = useGame()
  return state.phase === 'setup' ? (
    <StartScreen dispatch={dispatch} onBack={onExit} />
  ) : (
    <Cockpit state={state} dispatch={dispatch} />
  )
}
