import { useCockpit } from './cockpit-context'
import { useI18n } from '../i18n/I18nContext'
import { Die } from './Die'

// The current player's dice + coffee adjustment + reroll selection.
export function DiceTray() {
  const c = useCockpit()
  const { t } = useI18n()
  const dice = c.state.dice[c.viewer]
  const unplaced = dice.filter((d) => !d.placed)
  const selected = dice.find((d) => d.id === c.selectedDieId)

  return (
    <div
      data-id="dice-tray"
      className={`sticky bottom-0 z-20 flex flex-col gap-2 rounded-t-2xl border-t-4 p-3 ${
        c.viewer === 'pilot' ? 'border-pilot bg-pilot-dark/95' : 'border-copilot bg-copilot-dark/95'
      }`}
    >
      <div className="flex items-center justify-between text-xs font-bold text-white">
        <span>{t('tray.dice', { role: t(`role.${c.viewer}`) })}</span>
        <span className="text-white/80">
          {c.rerollMode ? t('tray.chooseReroll') : t('tray.chooseDie')}
        </span>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2">
        {unplaced.map((d) => (
          <Die
            key={d.id}
            value={d.value}
            owner={d.owner}
            size={48}
            selected={
              c.rerollMode ? c.rerollSelection.has(d.id) : c.selectedDieId === d.id
            }
            onClick={() =>
              c.rerollMode ? c.toggleRerollDie(d.id) : c.selectDie(d.id)
            }
          />
        ))}
        {unplaced.length === 0 && (
          <span className="py-2 text-sm text-white/80">{t('tray.allPlaced')}</span>
        )}
      </div>

      {c.rerollMode && (
        <button
          type="button"
          data-id="confirm-reroll"
          onClick={c.confirmReroll}
          disabled={c.rerollSelection.size === 0}
          className="mx-auto rounded-lg bg-emerald-500 px-4 py-1.5 text-sm font-bold text-white disabled:opacity-50"
        >
          {t('tray.reroll', { n: c.rerollSelection.size })}
        </button>
      )}

      {!c.rerollMode && selected && c.pendingValue !== null && (
        <CoffeeControls />
      )}
    </div>
  )
}

function CoffeeControls() {
  const c = useCockpit()
  const { t } = useI18n()
  if (c.pendingValue === null) return null
  return (
    <div className="flex items-center justify-center gap-3 rounded-lg bg-black/30 p-2">
      <button
        type="button"
        data-id="coffee-minus"
        onClick={() => c.adjust(-1)}
        disabled={!c.canAdjust(-1)}
        className="h-9 w-9 rounded-full bg-amber-600 text-lg font-bold text-white disabled:opacity-40"
      >
        −
      </button>
      <div className="flex flex-col items-center">
        <Die value={c.pendingValue} owner={c.viewer} size={44} />
        <span className="text-[10px] text-amber-200">
          {t('tray.coffeeUsed', { n: c.coffeeSpent })}
        </span>
      </div>
      <button
        type="button"
        data-id="coffee-plus"
        onClick={() => c.adjust(1)}
        disabled={!c.canAdjust(1)}
        className="h-9 w-9 rounded-full bg-amber-600 text-lg font-bold text-white disabled:opacity-40"
      >
        +
      </button>
      <span className="ml-2 max-w-[8rem] text-[10px] leading-tight text-white/80">
        {t('tray.placeHint')}
      </span>
    </div>
  )
}
