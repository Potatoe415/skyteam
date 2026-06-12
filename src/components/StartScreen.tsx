import type { Action } from '../game'
import { useI18n } from '../i18n/I18nContext'
import { LanguageSwitch } from './LanguageSwitch'

// Title / intro screen echoing the physical box: pick your seats, then take off.
export function StartScreen({
  dispatch,
  onBack,
}: {
  dispatch: (a: Action) => void
  onBack?: () => void
}) {
  const { t } = useI18n()
  return (
    <div
      data-id="start-screen"
      className="flex min-h-full flex-col items-center justify-center gap-6 p-6 text-center"
    >
      {onBack && (
        <button
          type="button"
          data-id="start-back-button"
          onClick={onBack}
          className="self-start text-sm text-white/60 underline-offset-2 hover:text-white/85 hover:underline"
        >
          ← {t('online.back')}
        </button>
      )}
      <LanguageSwitch />

      <div>
        <h1 className="text-5xl font-black tracking-tight text-white drop-shadow-[0_3px_6px_rgba(0,0,0,0.35)]">
          SKY TEAM
        </h1>
        <p className="mt-1 text-sm font-semibold text-sky-50">
          {t('start.subtitle')}
        </p>
      </div>

      <div className="flex gap-4">
        <RoleCard
          role="pilot"
          title={t('start.pilot.title')}
          subtitle={t('start.pilot.sub')}
        />
        <RoleCard
          role="copilot"
          title={t('start.copilot.title')}
          subtitle={t('start.copilot.sub')}
        />
      </div>

      <p className="max-w-xs text-xs leading-relaxed text-white/85">
        {t('start.instructions')}
      </p>

      <button
        type="button"
        data-id="start-button"
        onClick={() => dispatch({ type: 'START_GAME' })}
        className="rounded-2xl bg-amber-400 px-8 py-3 text-xl font-black text-amber-950 shadow-lg active:scale-95"
      >
        {t('start.button')}
      </button>

      <a
        href="https://www.scorpionmasque.com/sites/scorpionmasque.com/files/st_rules01_en_06jun2023.pdf"
        target="_blank"
        rel="noopener noreferrer"
        className="text-xs text-white/50 underline-offset-2 hover:text-white/75 hover:underline transition-colors"
      >
        📖 {t('start.rules')}
      </a>
    </div>
  )
}

// A boarding-pass / luggage-tag style card, echoing the physical Sky Team
// role tickets shown in the reference layout.
function RoleCard({
  role,
  title,
  subtitle,
}: {
  role: 'pilot' | 'copilot'
  title: string
  subtitle: string
}) {
  const surface =
    role === 'pilot'
      ? 'bg-gradient-to-br from-pilot-light to-pilot-dark'
      : 'bg-gradient-to-br from-copilot-light to-copilot-dark'
  return (
    <div
      data-id={`role-card-${role}`}
      className={`relative w-40 overflow-hidden rounded-2xl ${surface} text-left text-white shadow-board ring-1 ring-white/30`}
    >
      <div className="flex items-center justify-between bg-black/20 px-3 py-1.5">
        <span className="text-[10px] font-black tracking-[0.2em]">SKY TEAM</span>
        <span className="text-lg leading-none" aria-hidden>
          ✈
        </span>
      </div>

      {/* Perforated tear line */}
      <div className="flex items-center justify-between px-2">
        <span className="-ml-3 h-3 w-3 rounded-full bg-cockpit-bg" />
        <span className="my-1 flex-1 border-t border-dashed border-white/40" />
        <span className="-mr-3 h-3 w-3 rounded-full bg-cockpit-bg" />
      </div>

      <div className="px-3 pb-3">
        <div className="text-2xl font-black tracking-wide drop-shadow">{title}</div>
        <div className="mt-1 text-[10px] font-semibold leading-tight text-white/90">
          {subtitle}
        </div>
        {/* Faux barcode */}
        <div className="mt-3 flex h-5 items-end gap-[2px] opacity-80">
          {[3, 1, 2, 1, 3, 2, 1, 1, 2, 3, 1, 2, 1, 3, 1, 2].map((w, i) => (
            <span
              key={i}
              className="h-full bg-white"
              style={{ width: w }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
