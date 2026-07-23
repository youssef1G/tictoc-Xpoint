import { Link } from 'react-router-dom'
import { useLocale } from '../context/LocaleContext.jsx'

export default function About() {
  const { t } = useLocale()
  return (
    <div className="max-w-3xl mx-auto px-5 sm:px-8 py-16 sm:py-24">
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--brand-dim)] border border-[var(--brand)]/10 mb-5">
          <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--brand)]">{t('about.badge')}</span>
        </div>
        <h1 className="text-display text-[var(--text)]">{t('about.title')}</h1>
      </div>

      <div className="space-y-5 text-sm text-[var(--muted)] leading-relaxed">
        <p>{t('about.text1')}</p>
        <p>{t('about.text2')}</p>
        <p>{t('about.text3')}</p>
      </div>

      <div className="mt-12 text-center">
        <Link to="/shop" className="btn-primary px-8 py-3 text-sm">
          {t('about.exploreCollection')}
        </Link>
      </div>
    </div>
  )
}