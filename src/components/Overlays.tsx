import type { ReactNode } from 'react'
import {
  landingChecks,
  type GameState,
  type LandingCheckKey,
  type Role,
} from '../game'
import type { Action } from '../game'
import { useI18n } from '../i18n/I18nContext'

function Shell({
  children,
  tone = 'sky',
  // Fully opaque, viewport-covering screen (used for the pass-and-play handoff
  // so the previous player's dice can never show through).
  solid = false,
}: {
  children: ReactNode
  tone?: string
  solid?: boolean
}) {
  const bg = tone === 'win' ? 'from-emerald-600 to-emerald-800' : tone === 'lose' ? 'from-rose-700 to-rose-900' : 'from-sky-700 to-cockpit-bg'
  const backdrop = solid
    ? 'fixed inset-0 z-50 bg-gradient-to-b from-cockpit-bg to-[#06202c]'
    : 'absolute inset-0 z-40 bg-black/60'
  return (
    <div className={`flex items-center justify-center p-4 ${backdrop}`}>
      <div className={`w-full max-w-sm rounded-2xl bg-gradient-to-b ${bg} p-5 text-center shadow-2xl`}>
        {children}
      </div>
    </div>
  )
}

export function BriefingOverlay({ state, dispatch }: { state: GameState; dispatch: (a: Action) => void }) {
  const { t } = useI18n()
  return (
    <Shell>
      <h2 className="text-xl font-black text-white" data-id="briefing-title">
        {t('briefing.title', { round: state.round })}
      </h2>
      <p className="mt-1 text-sm text-sky-100">
        {t('briefing.altitude', { altitude: state.altitude })}
      </p>
      <p className="mt-3 text-sm text-white/90">
        {t('briefing.strategy', { role: t(`role.${state.startingPlayer}`) })}
      </p>
      <p className="mt-2 text-xs text-amber-200">{t('briefing.silence')}</p>
      <button
        type="button"
        data-id="roll-button"
        onClick={() => dispatch({ type: 'ROLL_DICE' })}
        className="mt-4 w-full rounded-xl bg-amber-400 py-3 text-lg font-black text-amber-950 active:scale-95"
      >
        {t('briefing.roll')}
      </button>
    </Shell>
  )
}

export function HandoffOverlay({ player, onReveal }: { player: Role; onReveal: () => void }) {
  const { t } = useI18n()
  const role = t(`role.${player}`)
  return (
    <Shell solid>
      <h2 className="text-xl font-black text-white">{t('handoff.title', { role })}</h2>
      <p className="mt-2 text-sm text-white/90">{t('handoff.body', { role })}</p>
      <button
        type="button"
        data-id="handoff-reveal"
        onClick={onReveal}
        className={`mt-4 w-full rounded-xl py-3 text-lg font-black text-white active:scale-95 ${
          player === 'pilot' ? 'bg-pilot' : 'bg-copilot'
        }`}
      >
        {t('handoff.reveal', { role })}
      </button>
    </Shell>
  )
}

export function RoundEndOverlay({ state, dispatch }: { state: GameState; dispatch: (a: Action) => void }) {
  const { t } = useI18n()
  return (
    <Shell>
      <h2 className="text-xl font-black text-white">{t('roundEnd.title')}</h2>
      <ul className="mt-3 space-y-1 text-left text-sm text-sky-100">
        <li>
          {t('roundEnd.position', {
            pos: state.currentPosition,
            airport: state.airportIndex,
          })}
        </li>
        <li>{t('roundEnd.axis', { axis: state.axis })}</li>
        <li>
          {t('roundEnd.resources', {
            coffee: state.coffee,
            rerolls: state.rerolls,
          })}
        </li>
      </ul>
      <button
        type="button"
        data-id="next-round-button"
        onClick={() => dispatch({ type: 'NEXT_ROUND' })}
        className="mt-4 w-full rounded-xl bg-amber-400 py-3 text-lg font-black text-amber-950 active:scale-95"
      >
        {t('roundEnd.next')}
      </button>
    </Shell>
  )
}

export function ResultOverlay({ state, dispatch }: { state: GameState; dispatch: (a: Action) => void }) {
  const { t } = useI18n()
  const won = state.result === 'won'
  const checks = landingChecks(state)
  return (
    <Shell tone={won ? 'win' : 'lose'}>
      <div className="text-5xl">{won ? '🛬🎉' : '💥'}</div>
      <h2 className="mt-2 text-2xl font-black text-white" data-id="result-title">
        {won ? t('result.won') : t('result.lost')}
      </h2>
      {!won && state.lossReason && (
        <p className="mt-2 text-sm text-rose-100" data-id="loss-reason">
          {t(`loss.${state.lossReason}`)}
        </p>
      )}
      <ul className="mx-auto mt-3 w-fit space-y-1 text-left text-sm">
        {(Object.entries(checks) as [LandingCheckKey, boolean][]).map(([k, ok]) => (
          <li key={k} className={ok ? 'text-emerald-200' : 'text-rose-200'}>
            {ok ? '✓' : '✗'} {t(`check.${k}`)}
          </li>
        ))}
      </ul>
      <button
        type="button"
        data-id="restart-button"
        onClick={() => dispatch({ type: 'RESTART' })}
        className="mt-4 w-full rounded-xl bg-white py-3 text-lg font-black text-slate-900 active:scale-95"
      >
        {t('result.restart')}
      </button>
    </Shell>
  )
}
