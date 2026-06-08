import type { GameState } from '../game'
import { useI18n } from '../i18n/I18nContext'

const MAX = 14

function pct(v: number): string {
  return `${Math.min(100, Math.max(0, (v / MAX) * 100))}%`
}

// Horizontal aerodynamics gauge. The blue (gear) and orange (flaps) markers set
// the thresholds that turn engine speed into 0/1/2 spaces of advance. On the
// landing round, speed is compared to the brakes instead.
export function SpeedGauge({ state }: { state: GameState }) {
  const { t } = useI18n()
  const blue = state.slots['engine-blue']
  const orange = state.slots['engine-orange']
  const speed = blue && orange ? blue.value + orange.value : null

  return (
    <div data-id="speed-gauge" className="w-full rounded-xl cavity px-2 py-1.5">
      <div className="mb-1 flex items-center justify-between text-[10px] font-bold text-sky-100">
        <span className="tracking-wide">{t('speed.title')}</span>
        {speed !== null && (
          <span data-id="speed-current" className="rounded bg-black/40 px-1.5 text-amber-300">
            {t('speed.engines', { speed })}
          </span>
        )}
      </div>
      <div className="relative h-4 w-full rounded-full bg-gradient-to-r from-emerald-400 via-amber-400 to-rose-500 shadow-[inset_0_1px_3px_rgba(0,0,0,0.5)]">
        <Marker pos={state.blueMarker} className="border-t-pilot-light" label={t('speed.gear')} />
        <Marker pos={state.orangeMarker} className="border-t-copilot-light" label={t('speed.flaps')} />
        {speed !== null && (
          <div
            data-id="speed-needle"
            className="absolute top-1/2 z-10 h-6 w-[3px] -translate-x-1/2 -translate-y-1/2 rounded bg-white shadow-[0_0_4px_rgba(0,0,0,0.6)]"
            style={{ left: pct(speed) }}
          />
        )}
      </div>
      <div className="mt-1 flex justify-between text-[8px] font-semibold text-sky-200/70">
        {[2, 4, 6, 8, 10, 12].map((n) => (
          <span key={n}>{n}</span>
        ))}
      </div>
    </div>
  )
}

// A downward-pointing colored flag sitting above the gauge at its threshold.
function Marker({ pos, className, label }: { pos: number; className: string; label: string }) {
  const { t } = useI18n()
  return (
    <div
      className="absolute -top-1 z-20 -translate-x-1/2"
      style={{ left: pct(pos) }}
      title={t('speed.threshold', { label, pos })}
    >
      <span className={`block border-x-[5px] border-t-[7px] border-x-transparent ${className}`} />
    </div>
  )
}
