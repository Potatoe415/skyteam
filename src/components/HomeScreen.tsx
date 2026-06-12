import { useI18n } from '../i18n/I18nContext'
import { LanguageSwitch } from './LanguageSwitch'

// First screen: choose local pass-and-play or online multiplayer.
export function HomeScreen({
  onLocal,
  onOnline,
}: {
  onLocal: () => void
  onOnline: () => void
}) {
  const { t } = useI18n()
  return (
    <div
      data-id="home-screen"
      className="flex min-h-full flex-col items-center justify-center gap-8 p-6 text-center"
    >
      <LanguageSwitch />

      <div>
        <h1 className="text-5xl font-black tracking-tight text-white drop-shadow-[0_3px_6px_rgba(0,0,0,0.35)]">
          SKY TEAM
        </h1>
        <p className="mt-1 text-sm font-semibold text-sky-50">
          {t('start.subtitle')}
        </p>
      </div>

      <div className="flex w-full max-w-xs flex-col gap-4">
        <ModeButton
          dataId="home-play-local"
          icon="🎲"
          title={t('home.playLocal')}
          subtitle={t('home.localSub')}
          onClick={onLocal}
          className="bg-amber-400 text-amber-950"
        />
        <ModeButton
          dataId="home-play-online"
          icon="🌐"
          title={t('home.playOnline')}
          subtitle={t('home.onlineSub')}
          onClick={onOnline}
          className="bg-sky-400 text-sky-950"
        />
      </div>

      <a
        href="https://www.scorpionmasque.com/sites/scorpionmasque.com/files/st_rules01_en_06jun2023.pdf"
        target="_blank"
        rel="noopener noreferrer"
        className="text-xs text-white/50 underline-offset-2 transition-colors hover:text-white/75 hover:underline"
      >
        📖 {t('start.rules')}
      </a>
    </div>
  )
}

function ModeButton({
  dataId,
  icon,
  title,
  subtitle,
  onClick,
  className,
}: {
  dataId: string
  icon: string
  title: string
  subtitle: string
  onClick: () => void
  className: string
}) {
  return (
    <button
      type="button"
      data-id={dataId}
      onClick={onClick}
      className={`flex flex-col items-center gap-1 rounded-2xl px-6 py-5 shadow-lg active:scale-95 ${className}`}
    >
      <span className="text-3xl" aria-hidden>
        {icon}
      </span>
      <span className="text-xl font-black">{title}</span>
      <span className="text-xs font-semibold opacity-80">{subtitle}</span>
    </button>
  )
}
