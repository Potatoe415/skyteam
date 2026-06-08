import { Cockpit } from './components/Cockpit'
import { StartScreen } from './components/StartScreen'
import { useGame } from './hooks/useGame'

export default function App() {
  const [state, dispatch] = useGame()

  return (
    <div
      data-id="app-shell"
      className="mx-auto flex min-h-full w-full max-w-md flex-col text-white shadow-2xl"
    >
      {state.phase === 'setup' ? (
        <StartScreen dispatch={dispatch} />
      ) : (
        <Cockpit state={state} dispatch={dispatch} />
      )}
    </div>
  )
}
