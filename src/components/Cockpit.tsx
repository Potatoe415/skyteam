import type { Action, GameState, Role } from '../game'
import { usePlacement } from '../hooks/usePlacement'
import { useI18n } from '../i18n/I18nContext'
import { CockpitContext } from './cockpit-context'
import { AltitudeTrack } from './AltitudeTrack'
import { ApproachTrack } from './ApproachTrack'
import { CentralConsole } from './CentralConsole'
import { DiceTray } from './DiceTray'
import {
  BriefingOverlay,
  HandoffOverlay,
  ResultOverlay,
  RoundEndOverlay,
} from './Overlays'
import { RadioPanel } from './RadioPanel'
import { ResourcesPanel } from './ResourcesPanel'
import { StatusBar } from './StatusBar'
import { SwitchColumns } from './SwitchColumns'

interface CockpitProps {
  state: GameState
  dispatch: (a: Action) => void
  // When set, this device controls exactly one role (online play): no device
  // handoff, and inputs are gated to this role's turn.
  localRole?: Role
}

export function Cockpit({ state, dispatch, localRole }: CockpitProps) {
  const { api, needsHandoff, reveal, myTurn } = usePlacement(state, dispatch, localRole)

  return (
    <CockpitContext.Provider value={api}>
      <div data-id="cockpit" className="relative flex min-h-full flex-col">
        <StatusBar state={state} />

        <main className="flex flex-1 flex-col gap-3 p-3 pb-28">
          <div className="flex justify-center gap-2">
            <ApproachTrack state={state} />
            <AltitudeTrack state={state} />
          </div>
          <div
            data-id="cockpit-board"
            className="steel-panel flex flex-col gap-3 rounded-3xl p-3"
          >
            <CentralConsole state={state} />
            <RadioPanel />
            <SwitchColumns state={state} />
            <ResourcesPanel />
          </div>
        </main>

        {state.phase === 'placement' && !needsHandoff && myTurn && <DiceTray />}
        {state.phase === 'placement' && !myTurn && (
          <WaitingTurnBanner waitingFor={state.currentPlayer} />
        )}

        {state.phase === 'briefing' && <BriefingOverlay state={state} dispatch={dispatch} />}
        {state.phase === 'roundEnd' && <RoundEndOverlay state={state} dispatch={dispatch} />}
        {(state.phase === 'won' || state.phase === 'lost') && (
          <ResultOverlay state={state} dispatch={dispatch} />
        )}
        {needsHandoff && <HandoffOverlay player={state.currentPlayer} onReveal={reveal} />}
      </div>
    </CockpitContext.Provider>
  )
}

// Online: non-blocking banner shown while the partner takes their turn.
function WaitingTurnBanner({ waitingFor }: { waitingFor: Role }) {
  const { t } = useI18n()
  return (
    <div
      data-id="waiting-turn-banner"
      className={`sticky bottom-0 z-20 p-3 text-center text-sm font-bold text-white ${
        waitingFor === 'pilot' ? 'bg-pilot-dark/95' : 'bg-copilot-dark/95'
      }`}
    >
      {t('online.waitingTurn', { role: t(`role.${waitingFor}`) })}
    </div>
  )
}
