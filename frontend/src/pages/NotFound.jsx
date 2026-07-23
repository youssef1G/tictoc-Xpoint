import { Link } from 'react-router-dom'
import { useLocale } from '../context/LocaleContext.jsx'

export default function NotFound() {
  const { t } = useLocale()
  return (
    <div className="max-w-lg mx-auto px-5 py-24 text-center">
      <div className="w-16 h-16 rounded-full bg-[var(--brand-dim)] flex items-center justify-center mx-auto mb-5">
        <span className="text-xl font-bold text-[var(--brand)]">404</span>
      </div>
      <h1 className="text-display text-[var(--text)] mb-2">{t('notfound.title')}</h1>
      <p className="text-sm text-[var(--muted)] mb-8">{t('notfound.desc')}</p>
      <Link to="/" className="btn-primary text-sm">{t('notfound.backHome')}</Link>
    </div>
  )
}