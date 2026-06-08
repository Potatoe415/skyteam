import { REROLL_ROUNDS, altitudeForRound, type GameState } from '../game'
import { useI18n } from '../i18n/I18nContext'

const LEVELS = [0, 1000, 2000, 3000, 4000, 5000, 6000] // top -> bottom

const REROLL_ALTITUDES = REROLL_ROUNDS.map(altitudeForRound)

// Vertical altitude strip: 0 (touchdown) on top, 6000 ft at the bottom.
export function AltitudeTrack({ state }: { state: GameState }) {
  const { t } = useI18n()
  return (
    <div
      data-id="altitude-track"
      className="flex w-24 flex-col gap-1 rounded-2xl steel-panel p-1.5"
    >
      <div className="engraved rounded-md bg-black/15 py-0.5 text-center text-[9px] font-black">
        {t('panel.altitude')}
      </div>
      {LEVELS.map((alt) => {
        const here = alt === state.altitude
        const reroll = REROLL_ALTITUDES.includes(alt)
        return (
          <div
            key={alt}
            data-id={`altitude-${alt}`}
            className={`relative flex h-9 items-center justify-center rounded-md border text-xs font-bold shadow-[inset_0_1px_3px_rgba(0,0,0,0.6)] ${
              alt === 0
                ? 'border-emerald-300/70 bg-gradient-to-b from-emerald-600/70 to-emerald-800/70 text-emerald-50'
                : 'border-sky-400/25 bg-gradient-to-b from-[#163750] to-[#0b2030] text-sky-100'
            } ${here ? 'ring-2 ring-amber-300 text-amber-200' : ''}`}
          >
            {alt === 0 ? '🛬' : alt}
            {reroll && (
              <span
                className="absolute -left-1 -top-1 text-[11px]"
                title={t('altitude.rerollToken')}
                data-id={`reroll-icon-${alt}`}
              >
                🔄
              </span>
            )}
            {here && (
              <span
                data-id="altitude-current-marker"
                className="absolute -right-1 -top-1 text-sm"
              >
                ✈️
              </span>
            )}
          </div>
        )
      })}
    </div>
  )
}
