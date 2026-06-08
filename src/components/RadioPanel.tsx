import { useI18n } from '../i18n/I18nContext'
import { Slot } from './Slot'

// Radio: clear traffic ahead. Pilot has 1 slot, Co-Pilot has 2. Any value.
export function RadioPanel() {
  const { t } = useI18n()
  return (
    <div
      data-id="radio-panel"
      className="flex flex-col items-center gap-1.5 rounded-xl steel-inset p-2"
    >
      <span className="engraved text-[10px] font-black">
        {t('panel.radio')}
      </span>
      <div className="flex gap-2 rounded-lg cavity p-1.5">
        <Slot id="radio-blue" />
        <Slot id="radio-orange-1" />
        <Slot id="radio-orange-2" />
      </div>
    </div>
  )
}
