import { useState } from 'react'
import type { Role } from '../game'
import { useI18n } from '../i18n/I18nContext'
import type { GameView } from '../online/types'

// Lobby shown after creating/joining a room: room code, crew list, role pick
// (host only) and the start button.
export function WaitingRoom({
  view,
  onStart,
  onLeave,
}: {
  view: GameView
  onStart: (hostRole: Role) => void
  onLeave: () => void
}) {
  const { t } = useI18n()
  const [hostRole, setHostRole] = useState<Role>(view.myRole ?? 'pilot')
  const full = view.players.length >= 2

  return (
    <div
      data-id="waiting-room"
      className="flex min-h-full flex-col items-center justify-center gap-6 p-6 text-center"
    >
      <h1 className="text-2xl font-black text-white">{t('wait.title')}</h1>

      <div className="rounded-2xl bg-black/30 px-8 py-4">
        <div className="text-xs font-bold uppercase tracking-wide text-sky-200">
          {t('wait.code')}
        </div>
        <div
          data-id="waiting-room-code"
          className="text-5xl font-black tracking-[0.3em] text-amber-300"
        >
          {view.roomCode}
        </div>
        <p className="mt-1 text-[11px] text-white/70">{t('wait.share')}</p>
      </div>

      <CrewList view={view} t={t} />

      {view.isHost ? (
        <div className="flex w-full max-w-xs flex-col gap-3">
          <RolePicker value={hostRole} onChange={setHostRole} t={t} />
          <button
            type="button"
            data-id="waiting-start-button"
            disabled={!full}
            onClick={() => onStart(hostRole)}
            className="w-full rounded-2xl bg-amber-400 px-6 py-3 text-lg font-black text-amber-950 shadow-lg active:scale-95 disabled:opacity-50"
          >
            {t('wait.start')}
          </button>
          {!full && (
            <p className="text-xs text-white/70">{t('wait.needTwo')}</p>
          )}
        </div>
      ) : (
        <p className="text-sm text-sky-100">{t('wait.waitingHost')}</p>
      )}

      <button
        type="button"
        data-id="waiting-leave-button"
        onClick={onLeave}
        className="text-sm text-white/60 underline-offset-2 hover:text-white/85 hover:underline"
      >
        ← {t('wait.leave')}
      </button>
    </div>
  )
}

function CrewList({ view, t }: { view: GameView; t: (k: string) => string }) {
  const seats = [0, 1]
  return (
    <ul data-id="waiting-crew" className="w-full max-w-xs space-y-2">
      {seats.map((seat) => {
        const p = view.players.find((pl) => pl.seat === seat)
        const isMe = p?.role != null && p.role === view.myRole
        return (
          <li
            key={seat}
            className="flex items-center justify-between rounded-xl bg-white/10 px-4 py-2 text-left"
          >
            <span className="font-semibold text-white">
              {p?.displayName ?? t('wait.empty')}
              {isMe && <span className="ml-1 text-amber-300">{t('wait.you')}</span>}
            </span>
            {p?.role && (
              <span className="text-xs font-bold uppercase text-sky-200">
                {t(`role.${p.role}`)}
              </span>
            )}
          </li>
        )
      })}
    </ul>
  )
}

function RolePicker({
  value,
  onChange,
  t,
}: {
  value: Role
  onChange: (r: Role) => void
  t: (k: string) => string
}) {
  return (
    <div data-id="waiting-role-picker">
      <div className="mb-1 text-xs font-bold uppercase tracking-wide text-sky-200">
        {t('wait.yourRole')}
      </div>
      <div className="flex gap-2">
        {(['pilot', 'copilot'] as Role[]).map((r) => (
          <button
            key={r}
            type="button"
            data-id={`waiting-role-${r}`}
            aria-pressed={value === r}
            onClick={() => onChange(r)}
            className={`flex-1 rounded-xl px-3 py-2 text-sm font-black active:scale-95 ${
              value === r
                ? r === 'pilot'
                  ? 'bg-pilot text-white'
                  : 'bg-copilot text-white'
                : 'bg-white/15 text-white/80'
            }`}
          >
            {t(`role.${r}`)}
          </button>
        ))}
      </div>
    </div>
  )
}
