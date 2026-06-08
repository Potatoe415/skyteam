import type { GameState, SlotId } from '../game'
import { useI18n } from '../i18n/I18nContext'
import { Slot } from './Slot'

interface GroupProps {
  id: string
  title: string
  rows: { id: SlotId; label: string; on: boolean }[]
}

function SwitchGroup({ id, title, rows }: GroupProps) {
  return (
    <div
      data-id={`switch-group-${id}`}
      className="flex flex-col gap-1.5 rounded-xl steel-inset p-2"
    >
      <span className="engraved text-center text-[10px] font-black">
        {title}
      </span>
      {rows.map((r) => (
        <div key={r.id} className="flex items-center gap-1.5">
          <span className="w-7 text-right text-[10px] font-bold text-steel-ink">
            {r.label}
          </span>
          <Slot id={r.id} size={36} help={false} />
          <span
            data-id={`light-${r.id}`}
            className={`h-3 w-3 rounded-full ring-1 ring-black/50 ${
              r.on
                ? 'bg-emerald-400 shadow-[0_0_6px_2px_rgba(52,211,153,0.8)]'
                : 'bg-zinc-700 shadow-[inset_0_1px_2px_rgba(0,0,0,0.7)]'
            }`}
          />
        </div>
      ))}
    </div>
  )
}

export function SwitchColumns({ state }: { state: GameState }) {
  const { t } = useI18n()
  const { gear, flaps, brakes } = state.switches
  return (
    <div className="flex justify-center gap-3">
      <div className="flex flex-col gap-3">
        <SwitchGroup
          id="gear"
          title={t('panel.gear')}
          rows={[
            { id: 'gear-1', label: '1·2', on: gear[0] },
            { id: 'gear-2', label: '3·4', on: gear[1] },
            { id: 'gear-3', label: '5·6', on: gear[2] },
          ]}
        />
        <SwitchGroup
          id="brakes"
          title={t('panel.brakes')}
          rows={[
            { id: 'brakes-1', label: '2', on: brakes[0] },
            { id: 'brakes-2', label: '4', on: brakes[1] },
            { id: 'brakes-3', label: '6', on: brakes[2] },
          ]}
        />
      </div>
      <SwitchGroup
        id="flaps"
        title={t('panel.flaps')}
        rows={[
          { id: 'flaps-1', label: '1·2', on: flaps[0] },
          { id: 'flaps-2', label: '2·3', on: flaps[1] },
          { id: 'flaps-3', label: '4·5', on: flaps[2] },
          { id: 'flaps-4', label: '5·6', on: flaps[3] },
        ]}
      />
    </div>
  )
}
