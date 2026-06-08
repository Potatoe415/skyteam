import { useCockpit } from './cockpit-context'
import { useI18n } from '../i18n/I18nContext'
import { Slot } from './Slot'

// Concentration (generate coffee), the coffee supply, and reroll tokens.
export function ResourcesPanel() {
  const { state, rerollMode, toggleRerollMode } = useCockpit()
  const { t } = useI18n()
  return (
    <div
      data-id="resources-panel"
      className="flex flex-col gap-2 rounded-xl steel-inset p-2"
    >
      <div className="flex flex-col items-center gap-1.5">
        <span className="engraved text-[10px] font-black">
          {t('panel.concentration')}
        </span>
        <div className="flex gap-2 rounded-lg cavity p-1.5">
          <Slot id="concentration-1" />
          <Slot id="concentration-2" />
          <Slot id="concentration-3" />
        </div>
      </div>

      <div className="flex items-center justify-center gap-4">
        <div
          data-id="coffee-supply"
          className="flex items-center gap-1 rounded-lg bg-black/30 px-2 py-0.5 text-sm"
        >
          <span className="text-lg">☕</span>
          <span className="font-bold text-amber-200">{state.coffee}/3</span>
        </div>
        <button
          type="button"
          data-id="reroll-button"
          onClick={toggleRerollMode}
          disabled={state.rerolls <= 0}
          className={`flex items-center gap-1 rounded-lg px-3 py-1 text-sm font-bold transition ${
            state.rerolls <= 0
              ? 'cursor-not-allowed bg-zinc-700 text-zinc-400'
              : rerollMode
                ? 'bg-emerald-500 text-white ring-2 ring-white'
                : 'bg-sky-600 text-white active:scale-95'
          }`}
        >
          {t('resources.reroll', { n: state.rerolls })}
        </button>
      </div>
    </div>
  )
}
