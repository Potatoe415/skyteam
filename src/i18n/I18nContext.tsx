// Language context: current language, a setter (persisted), and a `t` helper.
// Keep this the only place that reads/writes the language so switching is atomic.

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { MESSAGES, type Language } from './messages'

const STORAGE_KEY = 'skyteam.lang'

function isLanguage(v: unknown): v is Language {
  return v === 'en' || v === 'fr'
}

function detectInitial(): Language {
  if (typeof window === 'undefined') return 'en'
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY)
    if (isLanguage(saved)) return saved
  } catch {
    // ignore storage access errors (private mode, etc.)
  }
  const nav = window.navigator?.language?.toLowerCase() ?? ''
  return nav.startsWith('fr') ? 'fr' : 'en'
}

export type TranslateParams = Record<string, string | number>

export interface I18n {
  lang: Language
  setLang: (lang: Language) => void
  t: (key: string, params?: TranslateParams) => string
}

const I18nContext = createContext<I18n | null>(null)

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>(detectInitial)

  useEffect(() => {
    if (typeof document !== 'undefined') document.documentElement.lang = lang
  }, [lang])

  const setLang = useCallback((next: Language) => {
    setLangState(next)
    try {
      window.localStorage.setItem(STORAGE_KEY, next)
    } catch {
      // ignore storage access errors
    }
  }, [])

  const t = useCallback(
    (key: string, params?: TranslateParams) => {
      const dict = MESSAGES[lang]
      let str = dict[key] ?? MESSAGES.en[key] ?? key
      if (params) {
        for (const [name, value] of Object.entries(params)) {
          str = str.split(`{${name}}`).join(String(value))
        }
      }
      return str
    },
    [lang],
  )

  const value = useMemo<I18n>(() => ({ lang, setLang, t }), [lang, setLang, t])
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n(): I18n {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n must be used within an I18nProvider')
  return ctx
}
