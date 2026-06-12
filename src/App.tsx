import { useState } from 'react'
import { HomeScreen } from './components/HomeScreen'
import { LocalGame } from './components/LocalGame'
import { OnlineGame } from './components/OnlineGame'
import { OnlineLobby } from './components/OnlineLobby'
import type { GameView } from './online/types'

type Screen = 'home' | 'local' | 'onlineLobby' | 'onlineGame'

export default function App() {
  const [screen, setScreen] = useState<Screen>('home')
  const [onlineView, setOnlineView] = useState<GameView | null>(null)

  function goHome() {
    setOnlineView(null)
    setScreen('home')
  }

  return (
    <div
      data-id="app-shell"
      className="mx-auto flex min-h-full w-full max-w-md flex-col text-white shadow-2xl"
    >
      {screen === 'home' && (
        <HomeScreen
          onLocal={() => setScreen('local')}
          onOnline={() => setScreen('onlineLobby')}
        />
      )}

      {screen === 'local' && <LocalGame onExit={goHome} />}

      {screen === 'onlineLobby' && (
        <OnlineLobby
          onJoined={(view) => {
            setOnlineView(view)
            setScreen('onlineGame')
          }}
          onBack={goHome}
        />
      )}

      {screen === 'onlineGame' && onlineView && (
        <OnlineGame initial={onlineView} onLeave={goHome} />
      )}
    </div>
  )
}
