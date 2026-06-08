import type { DieValue, Role } from '../game'
import { useI18n } from '../i18n/I18nContext'

// Pip layout per face: positions on a 3x3 grid (0..8).
const PIPS: Record<DieValue, number[]> = {
  1: [4],
  2: [0, 8],
  3: [0, 4, 8],
  4: [0, 2, 6, 8],
  5: [0, 2, 4, 6, 8],
  6: [0, 2, 3, 5, 6, 8],
}

interface DieProps {
  value: DieValue
  owner: Role
  size?: number
  selected?: boolean
  dimmed?: boolean
  faceDown?: boolean
  onClick?: () => void
}

export function Die({
  value,
  owner,
  size = 40,
  selected = false,
  dimmed = false,
  faceDown = false,
  onClick,
}: DieProps) {
  const { t } = useI18n()
  const base = owner === 'pilot' ? 'bg-pilot' : 'bg-copilot'
  const ring = selected ? 'ring-4 ring-white' : 'ring-1 ring-black/30'
  const interactive = onClick ? 'cursor-pointer active:scale-95' : ''
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      data-id={`die-${owner}-${faceDown ? 'hidden' : value}`}
      aria-label={
        faceDown
          ? t('die.hidden')
          : t('die.face', { role: t(`role.${owner}`), value })
      }
      className={`grid grid-cols-3 grid-rows-3 gap-[2px] rounded-lg p-[6px] shadow-die transition ${base} ${ring} ${interactive} ${
        dimmed ? 'opacity-40' : ''
      }`}
      style={{ width: size, height: size }}
    >
      {faceDown
        ? null
        : Array.from({ length: 9 }, (_, i) => (
            <span
              key={i}
              className={`rounded-full ${
                PIPS[value].includes(i) ? 'bg-white' : 'bg-transparent'
              }`}
            />
          ))}
    </button>
  )
}
