import type { GameState } from '../game'
import { useI18n } from '../i18n/I18nContext'

// Artificial-horizon style axis indicator. axis 0 = level; positive tilts toward
// the Pilot (blue) side, negative toward the Co-Pilot (orange) side. Reaching
// +/- axisLimit is a spin-out (loss).
export function AxisDial({ state }: { state: GameState }) {
  const { t } = useI18n()
  const { axis, axisLimit } = state
  const deg = axis * (75 / axisLimit)
  const danger = Math.abs(axis) >= axisLimit - 1
  const bezelRing = axis === 0 ? 'ring-emerald-300/80' : danger ? 'ring-rose-400' : 'ring-amber-300/70'

  const ticks = Array.from({ length: 24 }, (_, i) => i * 15)

  return (
    <div className="flex flex-col items-center gap-1" data-id="axis-dial">
      <div className={`relative h-32 w-32 rounded-full bg-gradient-to-b from-steel-light to-steel-dark p-[6px] shadow-board ring-2 ${bezelRing}`}>
        <div className="relative h-full w-full overflow-hidden rounded-full ring-2 ring-black/60">
          {/* Rotating sky / ground horizon */}
          <div
            className="absolute inset-0 transition-transform duration-500"
            style={{ transform: `rotate(${deg}deg)` }}
          >
            <div className="h-1/2 w-full bg-gradient-to-b from-sky-300 to-sky-500" />
            <div className="h-1/2 w-full bg-gradient-to-b from-amber-700 to-amber-950" />
            <div className="absolute left-0 right-0 top-1/2 h-[2px] -translate-y-1/2 bg-white/90" />
            <div className="absolute left-1/2 top-1/2 h-3 w-[2px] -translate-x-1/2 -translate-y-1/2 bg-white/70" />
          </div>

          {/* Compass tick marks around the rim */}
          {ticks.map((a) => (
            <span
              key={a}
              className={`absolute left-1/2 top-1/2 origin-bottom ${
                a % 45 === 0 ? 'h-[7px] w-[2px] bg-white/80' : 'h-[4px] w-[1px] bg-white/45'
              }`}
              style={{ transform: `rotate(${a}deg) translateY(-58px)` }}
            />
          ))}

          {/* Orange spin-out limit markers (left / right) */}
          <Triangle side="left" active={danger && axis < 0} />
          <Triangle side="right" active={danger && axis > 0} />

          {/* Fixed aircraft reference (yellow wings) */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="flex items-center">
              <span className="h-[3px] w-5 rounded-full bg-yellow-300 shadow" />
              <span className="mx-[2px] h-[7px] w-[7px] rounded-full border-2 border-yellow-300" />
              <span className="h-[3px] w-5 rounded-full bg-yellow-300 shadow" />
            </div>
          </div>

          {/* Top index pointer */}
          <span className="absolute left-1/2 top-0 -translate-x-1/2 border-x-[5px] border-t-[7px] border-x-transparent border-t-white/90" />
        </div>
      </div>
      <div
        data-id="axis-value"
        className={`engraved rounded px-2 text-[11px] font-black ${danger ? '!text-rose-700' : ''}`}
      >
        {t('axis.label', { axis: axis > 0 ? `+${axis}` : axis })}
      </div>
    </div>
  )
}

function Triangle({ side, active }: { side: 'left' | 'right'; active: boolean }) {
  const pos = side === 'left' ? 'left-[3px]' : 'right-[3px]'
  const border =
    side === 'left'
      ? 'border-y-[6px] border-r-[9px] border-y-transparent'
      : 'border-y-[6px] border-l-[9px] border-y-transparent'
  const color = active ? (side === 'left' ? 'border-r-rose-500' : 'border-l-rose-500') : side === 'left' ? 'border-r-copilot' : 'border-l-copilot'
  return (
    <span
      className={`absolute top-1/2 -translate-y-1/2 ${pos} ${border} ${color} ${active ? 'animate-pulse' : ''}`}
    />
  )
}
