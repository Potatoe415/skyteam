import type { Role } from '../game'
import { useI18n } from '../i18n/I18nContext'
import { startGame } from '../online/api'
import type { GameView } from '../online/types'
import { useOnlineGame } from '../online/useOnlineGame'
import { Cockpit } from './Cockpit'
import { WaitingRoom } from './WaitingRoom'

// Drives an online session: lobby (waiting room) until the host starts, then the
// cockpit rendered from the per-player redacted view.
export function OnlineGame({
  initial,
  onLeave,
}: {
  initial: GameView
  onLeave: () => void
}) {
  const { t } = useI18n()
  const { view, error, dispatch, applyView } = useOnlineGame(initial.gameId, initial)

  if (!view) {
    return <Centered>{t('online.connecting')}</Centered>
  }

  function handleStart(hostRole: Role) {
    startGame(initial.gameId, hostRole).then(applyView).catch(() => undefined)
  }

  if (view.status === 'lobby') {
    return <WaitingRoom view={view} onStart={handleStart} onLeave={onLeave} />
  }

  if (!view.state || !view.myRole) {
    return <Centered>{t('online.connecting')}</Centered>
  }

  return (
    <>
      {error && (
        <div
          data-id="online-banner-error"
          className="bg-rose-600 px-3 py-1 text-center text-xs font-semibold text-white"
        >
          {t('online.error', { message: error })}
        </div>
      )}
      <Cockpit state={view.state} dispatch={dispatch} localRole={view.myRole} />
    </>
  )
}

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <div
      data-id="online-status"
      className="flex min-h-full items-center justify-center p-6 text-center text-white"
    >
      {children}
    </div>
  )
}
