import { useLocale } from '../context/LocaleContext.jsx'

export function LoadingState({ label: _label }) {
  const { t } = useLocale()
  const label = _label ?? t('status.loading')
  return (
    <div className="flex justify-center py-32">
      <div className="flex items-center gap-3">
        <div className="w-5 h-5 border-2 border-[var(--brand)] border-t-transparent rounded-full animate-spin" />
        <span className="text-sm text-[var(--muted)]">{label}</span>
      </div>
    </div>
  )
}

export function ErrorState({ message, onRetry }) {
  const { t } = useLocale()
  return (
    <div className="flex flex-col items-center justify-center py-32 gap-4">
      <p className="text-sm text-[var(--muted)]">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="btn-primary text-sm">
          {t('status.tryAgain')}
        </button>
      )}
    </div>
  )
}