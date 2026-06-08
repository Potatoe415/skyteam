import type { GameState } from '../game'
import { useI18n } from '../i18n/I18nContext'

// Vertical approach strip: airport at the top, start at the bottom. Traffic is
// shown as plane icons; the current position carries the player's aircraft.
export function ApproachTrack({ state }: { state: GameState }) {
  const { t } = useI18n()
  const spaces = state.approach.map((sp, i) => ({ ...sp, index: i }))
  const ordered = [...spaces].reverse() // airport (highest index) on top

  return (
    <div
      data-id="approach-track"
      className="flex w-24 flex-col gap-1 rounded-2xl steel-panel p-1.5"
    >
      <div className="engraved rounded-md bg-black/15 py-0.5 text-center text-[9px] font-black">
        {t('panel.approach')}
      </div>
      {ordered.map((sp) => {
        const here = sp.index === state.currentPosition
        return (
          <div
            key={sp.index}
            data-id={`approach-space-${sp.index}`}
            className={`relative flex h-9 items-center justify-center rounded-md border text-xs shadow-[inset_0_1px_3px_rgba(0,0,0,0.6)] ${
              sp.isAirport
                ? 'border-emerald-300/70 bg-gradient-to-b from-emerald-600/70 to-emerald-800/70 text-emerald-50'
                : 'border-sky-400/25 bg-gradient-to-b from-[#163750] to-[#0b2030] text-sky-100'
            } ${here ? 'ring-2 ring-amber-300' : ''}`}
          >
            {sp.isAirport ? (
              <span className="text-[10px] font-bold">{t('approach.runway')}</span>
            ) : (
              <span className="tracking-tight text-rose-300">
                {sp.traffic > 0 ? '✈'.repeat(sp.traffic) : ''}
              </span>
            )}
            {here && (
              <span
                data-id="approach-current-plane"
                className="absolute -right-1 -top-1 text-sm"
                title={t('approach.currentPos')}
              >
                🛩️
              </span>
            )}
          </div>
        )
      })}
    </div>
  )
}
