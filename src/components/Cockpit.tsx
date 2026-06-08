import type { Action, GameState } from '../game'
import { usePlacement } from '../hooks/usePlacement'
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
}

export function Cockpit({ state, dispatch }: CockpitProps) {
  const { api, needsHandoff, reveal } = usePlacement(state, dispatch)

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

        {state.phase === 'placement' && !needsHandoff && <DiceTray />}

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
