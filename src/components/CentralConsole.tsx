import type { ReactNode } from 'react'
import type { GameState } from '../game'
import { useI18n } from '../i18n/I18nContext'
import { AxisDial } from './AxisDial'
import { SpeedGauge } from './SpeedGauge'
import { Slot } from './Slot'

// Mandatory centre of the cockpit: the axis dial + axis dice, the engines, and
// the speed gauge they feed into.
export function CentralConsole({ state }: { state: GameState }) {
  const { t } = useI18n()
  return (
    <div
      data-id="central-console"
      className="flex flex-col items-center gap-3 rounded-2xl steel-inset p-3"
    >
      <AxisDial state={state} />

      <div className="flex items-start justify-center gap-5">
        <Mandatory title={t('panel.axis')}>
          <Slot id="axis-blue" size={44} help={false} />
          <Slot id="axis-orange" size={44} help={false} />
        </Mandatory>

        <Mandatory title={t('panel.engines')}>
          <Slot id="engine-blue" size={44} help={false} />
          <Slot id="engine-orange" size={44} help={false} />
        </Mandatory>
      </div>

      <SpeedGauge state={state} />
    </div>
  )
}

function Mandatory({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <span className="engraved text-[10px] font-black">{title}</span>
      <div className="flex gap-2 rounded-xl cavity p-1.5">{children}</div>
    </div>
  )
}
