import { placedCount, totalDice, type GameState } from '../game'
import { useI18n } from '../i18n/I18nContext'

// Top bar: round, altitude, whose turn, and placement progress.
export function StatusBar({ state }: { state: GameState }) {
  const { t } = useI18n()
  const isPlacement = state.phase === 'placement'
  return (
    <div
      data-id="status-bar"
      className="sticky top-0 z-30 flex items-center justify-between border-b-2 border-black/40 bg-gradient-to-b from-cockpit-bg to-[#072634] px-3 py-2 text-white shadow-lg backdrop-blur"
    >
      <div className="text-xs font-bold">
        {t('status.round', { round: state.round, altitude: state.altitude })}
      </div>
      {isPlacement && (
        <div
          data-id="turn-indicator"
          className={`rounded-full px-3 py-0.5 text-xs font-black ${
            state.currentPlayer === 'pilot' ? 'bg-pilot' : 'bg-copilot'
          }`}
        >
          🤫 {t(`role.${state.currentPlayer}`)}
        </div>
      )}
      <div className="text-xs font-semibold text-sky-200">
        {isPlacement
          ? t('status.dice', {
              placed: placedCount(state),
              total: totalDice(state),
            })
          : t('status.briefing')}
      </div>
    </div>
  )
}
