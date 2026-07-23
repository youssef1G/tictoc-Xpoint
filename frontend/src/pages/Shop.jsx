import { Link } from 'react-router-dom'
import { STORES } from '../data/constants.js'
import { useLocale } from '../context/LocaleContext.jsx'

export default function Shop() {
  const { t } = useLocale()
  return (
    <div className="max-w-7xl mx-auto px-5 sm:px-8 py-10 sm:py-14">
      <div className="mb-10">
        <h1 className="text-display text-[var(--text)] mb-2">{t('shop.title')}</h1>
        <p className="text-sm text-[var(--muted)]">{t('shop.subtitle')}</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-6 sm:gap-8">
        {STORES.map(store => (
          <Link
            key={store.slug}
            to={`/shop/${store.slug}`}
            className="group surface-card rounded-3xl p-8 sm:p-10 flex flex-col items-center text-center gap-5 transition-all duration-300 hover:-translate-y-2 hover:shadow-lg border-2 border-transparent hover:border-[var(--border)]"
          >
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center text-white text-2xl font-heading font-bold shrink-0"
              style={{ backgroundColor: store.color }}
            >
              {store.slug === 'xpoint' ? 'XP' : 'TT'}
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl font-heading font-bold text-[var(--text)] mb-1">{store.slug === 'xpoint' ? t('brand.xpoint') : t('brand.tictoc')}</h2>
              <p className="text-sm text-[var(--muted)]">{store.slug === 'xpoint' ? t('shop.phoneAccessories') : t('shop.medalsAndStraps')}</p>
            </div>

            <span className="text-sm font-semibold text-[var(--brand)] group-hover:underline">
              {t('shop.browse', { subtitle: t('store.subtitle.' + store.slug) })}
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}