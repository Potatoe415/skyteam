import { useI18n } from '../i18n/I18nContext'
import { LANGUAGES } from '../i18n/messages'

// Language selector shown on the splash/home screens (persists the choice).
export function LanguageSwitch() {
  const { lang, setLang, t } = useI18n()
  return (
    <div
      data-id="language-switch"
      className="flex items-center gap-2"
      role="group"
      aria-label={t('start.language')}
    >
      <span className="text-[10px] font-bold uppercase tracking-wide text-sky-200">
        {t('start.language')}
      </span>
      <div className="flex gap-1 rounded-full bg-black/30 p-1">
        {LANGUAGES.map((l) => (
          <button
            key={l.code}
            type="button"
            data-id={`lang-${l.code}`}
            aria-pressed={lang === l.code}
            onClick={() => setLang(l.code)}
            className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold transition ${
              lang === l.code
                ? 'bg-amber-400 text-amber-950'
                : 'text-white/80 active:scale-95'
            }`}
          >
            <span aria-hidden>{l.flag}</span>
            {l.label}
          </button>
        ))}
      </div>
    </div>
  )
}
