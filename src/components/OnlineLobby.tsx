import { useState } from 'react'
import { useI18n } from '../i18n/I18nContext'
import { createGame, joinGame } from '../online/api'
import type { GameView } from '../online/types'
import { LanguageSwitch } from './LanguageSwitch'

// Enter a nickname, then create a new room or join one with a 3-char code.
export function OnlineLobby({
  onJoined,
  onBack,
}: {
  onJoined: (view: GameView) => void
  onBack: () => void
}) {
  const { t } = useI18n()
  const [nickname, setNickname] = useState('')
  const [code, setCode] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function run(fn: () => Promise<GameView>, guard?: string) {
    if (guard) {
      setError(guard)
      return
    }
    setBusy(true)
    setError(null)
    try {
      onJoined(await fn())
    } catch (e) {
      setError((e as Error).message)
      setBusy(false)
    }
  }

  const noName = nickname.trim() ? '' : t('online.needNickname')
  const badCode = code.length === 3 ? '' : t('online.needCode')

  return (
    <div
      data-id="online-lobby"
      className="flex min-h-full flex-col items-center justify-center gap-6 p-6 text-center"
    >
      <LanguageSwitch />
      <h1 className="text-3xl font-black tracking-tight text-white">
        {t('online.title')}
      </h1>

      <label className="w-full max-w-xs text-left">
        <span className="text-xs font-bold uppercase tracking-wide text-sky-200">
          {t('online.nickname')}
        </span>
        <input
          data-id="online-nickname-input"
          value={nickname}
          maxLength={24}
          onChange={(e) => setNickname(e.target.value)}
          placeholder={t('online.nicknamePlaceholder')}
          className="mt-1 w-full rounded-xl bg-white/95 px-4 py-3 text-lg font-semibold text-slate-900 outline-none ring-amber-400 focus:ring-2"
        />
      </label>

      <button
        type="button"
        data-id="online-create-button"
        disabled={busy}
        onClick={() => run(() => createGame(nickname.trim()), noName)}
        className="w-full max-w-xs rounded-2xl bg-amber-400 px-6 py-3 text-lg font-black text-amber-950 shadow-lg active:scale-95 disabled:opacity-60"
      >
        {busy ? t('online.busy') : t('online.create')}
      </button>

      <div className="w-full max-w-xs rounded-2xl bg-black/25 p-4">
        <label className="block text-left">
          <span className="text-xs font-bold uppercase tracking-wide text-sky-200">
            {t('online.codeLabel')}
          </span>
          <input
            data-id="online-code-input"
            value={code}
            inputMode="text"
            autoCapitalize="characters"
            onChange={(e) =>
              setCode(
                e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 3),
              )
            }
            placeholder="ABC"
            className="mt-1 w-full rounded-xl bg-white/95 px-4 py-3 text-center text-2xl font-black tracking-[0.4em] text-slate-900 outline-none ring-sky-400 focus:ring-2"
          />
        </label>
        <p className="mt-1 text-[11px] text-white/70">{t('online.codeHint')}</p>
        <button
          type="button"
          data-id="online-join-button"
          disabled={busy}
          onClick={() => run(() => joinGame(code, nickname.trim()), noName || badCode)}
          className="mt-3 w-full rounded-xl bg-sky-400 px-6 py-3 text-lg font-black text-sky-950 active:scale-95 disabled:opacity-60"
        >
          {busy ? t('online.busy') : t('online.join')}
        </button>
      </div>

      {error && (
        <p data-id="online-error" className="max-w-xs text-sm text-rose-200">
          {error}
        </p>
      )}

      <button
        type="button"
        data-id="online-back-button"
        onClick={onBack}
        className="text-sm text-white/60 underline-offset-2 hover:text-white/85 hover:underline"
      >
        ← {t('online.back')}
      </button>
    </div>
  )
}
