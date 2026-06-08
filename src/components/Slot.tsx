import { getSlot, type SlotId } from '../game'
import { useI18n } from '../i18n/I18nContext'
import { useCockpit } from './cockpit-context'
import { Die } from './Die'

interface SlotProps {
  id: SlotId
  label?: string
  size?: number
  // The decorative rules-reminder dot from the physical board. On by default.
  help?: boolean
}

// One action space. Renders the placed die, or an empty recessed tile that
// highlights and becomes tappable when it is a legal destination for the
// selected die. Empty tiles are tinted to the owning role, echoing the board's
// blue (Pilot) and orange (Co-Pilot) spaces.
export function Slot({ id, label, size = 40, help = true }: SlotProps) {
  const { state, legalSlots, place, selectedDieId } = useCockpit()
  const { t } = useI18n()
  const def = getSlot(id)
  const placed = state.slots[id]
  const isLegal = legalSlots.has(id)
  const selecting = selectedDieId !== null

  const dual = def.colors.length === 2
  const tint = dual
    ? 'from-pilot/35 to-copilot/35 ring-white/55'
    : def.colors[0] === 'pilot'
      ? 'from-pilot/45 to-pilot-dark/55 ring-pilot-light/80'
      : 'from-copilot/45 to-copilot-dark/55 ring-copilot-light/80'

  if (placed) {
    return (
      <div
        data-id={`slot-${id}`}
        className="flex items-center justify-center rounded-lg bg-black/35 p-[2px] shadow-slot"
        style={{ width: size, height: size }}
      >
        <Die value={placed.value} owner={placed.owner} size={size - 4} />
      </div>
    )
  }

  return (
    <button
      type="button"
      data-id={`slot-${id}`}
      onClick={() => isLegal && place(id)}
      disabled={!isLegal}
      aria-label={t('slot.aria', { id })}
      className={`relative flex items-center justify-center rounded-lg bg-gradient-to-b text-[10px] font-bold text-white/75 shadow-slot ring-1 transition ${tint} ${
        isLegal
          ? 'animate-pulse ring-2 ring-emerald-300 brightness-150'
          : selecting
            ? 'opacity-45'
            : ''
      }`}
      style={{ width: size, height: size }}
    >
      {help && (
        <span
          aria-hidden
          className="absolute left-[3px] top-[3px] flex h-[13px] w-[13px] items-center justify-center rounded-full bg-black/35 text-[9px] font-black leading-none text-white/70 ring-1 ring-white/30"
        >
          ?
        </span>
      )}
      {label}
    </button>
  )
}
