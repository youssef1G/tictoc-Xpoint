import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Zap, Headphones, Smartphone, Watch, Plug, Cable, BatteryCharging, ShieldCheck, Music2, Car, Gamepad2, Package } from 'lucide-react'
import { fetchProducts } from '../api.js'
import ProductCard from '../components/ProductCard.jsx'
import { LoadingState, ErrorState } from '../components/StatusStates.jsx'
import { useLocale } from '../context/LocaleContext.jsx'
import Seo from '../components/Seo.jsx'

const CATEGORY_ICONS = {
  'Phone Cases':       Smartphone,
  'Chargers':          Plug,
  'Cables':            Cable,
  'Power Banks':       BatteryCharging,
  'Screen Protectors': ShieldCheck,
  'Earbuds':           Headphones,
  'Headphones':        Music2,
  'Smart Watches':     Watch,
  'Car Accessories':   Car,
  'Gaming':            Gamepad2,
}

function HeroIllustration() {
  const { t } = useLocale()
  const orbitIcons = [
    { Icon: Zap,        angle: 45,  size: 'w-10 h-10 sm:w-12 sm:h-12', iconSize: 16, tint: 'bg-[var(--accent)]/10 border-[var(--accent)]/20', color: 'text-[var(--accent)]', duration: '30s' },
    { Icon: Headphones, angle: 135, size: 'w-8 h-8 sm:w-10 sm:h-10',   iconSize: 14, tint: 'bg-[var(--brand-dim)] border-[var(--brand)]/10',  color: 'text-[var(--brand)]',  duration: '38s' },
    { Icon: Smartphone, angle: 225, size: 'w-7 h-7 sm:w-8 sm:h-8',     iconSize: 12, tint: 'bg-[var(--accent-dim)] border-[var(--accent)]/10', color: 'text-[var(--accent)]', duration: '26s' },
    { Icon: Watch,      angle: 315, size: 'w-9 h-9 sm:w-11 sm:h-11',   iconSize: 15, tint: 'bg-[var(--brand)]/5 border-[var(--brand)]/10',     color: 'text-[var(--brand)]',  duration: '44s' },
  ]

  return (
    <div className="relative w-full max-w-[260px] sm:max-w-[340px] lg:max-w-[480px] mx-auto aspect-square">
      <style>{`
        @keyframes ring-spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes orbit-spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes orbit-spin-reverse {
          from { transform: rotate(0deg); }
          to   { transform: rotate(-360deg); }
        }
        .ring-slow { transform-origin: 100px 100px; animation: ring-spin 110s linear infinite; }
        .ring-slow-reverse { transform-origin: 100px 100px; animation: ring-spin 150s linear infinite reverse; }
        .orbit-track { animation: orbit-spin var(--orbit-duration, 34s) linear infinite; }
        .orbit-counter { animation: orbit-spin-reverse var(--orbit-duration, 34s) linear infinite; }
        .orbit-radius { --r: 96px; }
        @media (min-width: 640px) { .orbit-radius { --r: 130px; } }
        @media (min-width: 1024px) { .orbit-radius { --r: 178px; } }
      `}</style>

      {/* Background rings + ambient dots */}
      <div className="absolute inset-0 flex items-center justify-center opacity-[0.04] dark:opacity-[0.08]">
        <svg viewBox="0 0 200 200" className="w-full h-full">
          <circle cx="100" cy="100" r="95" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-[var(--brand)] ring-slow" />
          <circle cx="100" cy="100" r="70" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-[var(--accent)] ring-slow-reverse" />
          <circle cx="100" cy="100" r="45" fill="none" stroke="currentColor" strokeWidth="1" className="text-[var(--brand)]" />
          <circle cx="100" cy="40" r="8" fill="currentColor" className="text-[var(--brand)] animate-float" style={{ animationDelay: '0s' }} />
          <circle cx="155" cy="70" r="6" fill="currentColor" className="text-[var(--accent)] animate-float" style={{ animationDelay: '1s' }} />
          <circle cx="150" cy="140" r="9" fill="currentColor" className="text-[var(--brand)] animate-float" style={{ animationDelay: '2s' }} />
          <circle cx="55" cy="140" r="7" fill="currentColor" className="text-[var(--accent)] animate-float" style={{ animationDelay: '1.5s' }} />
          <circle cx="40" cy="60" r="8" fill="currentColor" className="text-[var(--brand)] animate-float" style={{ animationDelay: '0.7s' }} />
          <circle cx="100" cy="100" r="15" fill="currentColor" className="text-[var(--brand)] animate-glow" />
        </svg>
      </div>

      {/* Logo — stays completely static */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-36 h-36 sm:w-44 sm:h-44 lg:w-56 lg:h-56 rounded-full border border-[var(--border)] flex items-center justify-center bg-[var(--surface)]/60 backdrop-blur-sm">
          <img src="/logo.jpg" alt={t('brand.tictoc') + ' ' + t('brand.xpoint')} className="w-20 h-20 sm:w-24 sm:h-24 lg:w-36 lg:h-36 rounded-2xl object-cover shadow-lg" />
        </div>
      </div>

      {/* Orbiting icons */}
      {orbitIcons.map(({ Icon, angle, size, iconSize, tint, color, duration }, i) => (
        <div
          key={i}
          className="orbit-track absolute inset-0"
          style={{ '--orbit-duration': duration, transform: `rotate(${angle}deg)` }}
        >
          <div className="orbit-radius absolute top-1/2 left-1/2" style={{ transform: 'translate(-50%, -50%) translateY(calc(var(--r) * -1))' }}>
            <div className="orbit-counter" style={{ '--orbit-duration': duration }}>
              <div className={`${size} rounded-full ${tint} border flex items-center justify-center shadow-sm`}>
                <Icon size={iconSize} className={color} strokeWidth={2} />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default function Home() {
  const { t } = useLocale()
  const [products, setProducts] = useState([])
  const [status, setStatus] = useState('loading')
  const load = () => {
    setStatus('loading')
    fetchProducts()
      .then(d => { setProducts(d); setStatus('ready') })
      .catch(() => setStatus('error'))
  }
  useEffect(() => { load() }, [])

  const categories = [...new Set(products.map(p => p.category))].slice(0, 5)
  const featured = [...products.filter(p => p.tag === 'Bestseller'), ...products.filter(p => p.tag === 'New')].slice(0, 4)

  const categoryStore = {}
  products.forEach(p => {
    const store = p.store || 'xpoint'
    if (!categoryStore[p.category]) categoryStore[p.category] = new Set()
    categoryStore[p.category].add(store)
  })

  return (
    <>
      <Seo title={t('seo.title.home')} description={t('seo.desc.home')} />
      <div>
        <section className="relative overflow-hidden border-b border-[var(--border)]">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 pt-12 pb-16 sm:pt-20 sm:pb-28 grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          <div className="animate-fade-up order-2 lg:order-1">
            <h1 className="font-heading text-[2.25rem] sm:text-[3rem] lg:text-[3.5rem] font-bold leading-[1.08] tracking-[-0.025em] text-[var(--text)] mb-5" dangerouslySetInnerHTML={{ __html: t('home.heroTitle') }} />
            <p className="text-base sm:text-lg text-[var(--muted)] max-w-md leading-relaxed">
              {t('home.heroDescXpoint', { brand: t('brand.xpoint') })} <br className="hidden sm:block" />
              {t('home.heroDescTictoc', { brand: t('brand.tictoc') })}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/shop" className="btn-primary px-7 py-3.5 text-[15px]">
                {t('home.exploreStores')}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </Link>
              <Link to="/about" className="btn-secondary px-7 py-3.5 text-[15px]">
                {t('home.ourStory')}
              </Link>
            </div>
          </div>
          <div className="order-1 lg:order-2 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <HeroIllustration />
          </div>
        </div>
      </section>

      {status === 'loading' && <LoadingState label={t('home.loading')} />}
      {status === 'error' && <ErrorState message={t('home.loadError')} onRetry={load} />}

      {status === 'ready' && (
        <>
          {categories.length > 0 && (
            <section className="max-w-7xl mx-auto px-5 sm:px-8 py-16 sm:py-24">
              <div className="flex items-end justify-between mb-10">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[var(--muted)] mb-2">{t('home.browse')}</p>
                  <h2 className="text-heading-xl text-[var(--text)]">{t('home.shopByCategory')}</h2>
                </div>
                <Link to="/shop" className="hidden sm:inline-flex text-sm font-medium text-[var(--brand)] hover:underline">
                  {t('home.viewAll')}
                </Link>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
                {categories.map(cat => {
                  const CategoryIcon = CATEGORY_ICONS[cat] || Package
                  const stores = categoryStore[cat]
                  const singleStore = stores && stores.size === 1 ? [...stores][0] : null
                  return (
                    <Link key={cat} to={singleStore ? `/shop/${singleStore}?category=${encodeURIComponent(cat)}` : `/shop`}
                      className="group surface-card p-5 sm:p-6 flex flex-col items-center text-center gap-3 transition-all duration-300 hover:-translate-y-1 hover:border-[var(--brand)]/40 hover:shadow-md">
                      <div className="w-14 h-14 rounded-2xl bg-[var(--brand-dim)] flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:bg-[var(--brand)]/15">
                        <CategoryIcon size={24} strokeWidth={1.75} className="text-[var(--brand)]" />
                      </div>
                      <span className="text-[13px] sm:text-sm font-semibold text-[var(--text)] tracking-tight leading-tight">{t('cat.' + cat) || cat}</span>
                    </Link>
                  )
                })}
              </div>
            </section>
          )}

          {featured.length > 0 && (
            <section className="bg-[var(--muted)]/5 border-y border-[var(--border)] py-16 sm:py-24">
              <div className="max-w-7xl mx-auto px-5 sm:px-8">
                <div className="flex items-end justify-between mb-10">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[var(--muted)] mb-2">{t('home.popular')}</p>
                    <h2 className="text-heading text-[var(--text)]">{t('home.bestsellers')}</h2>
                  </div>
                  <Link to="/shop" className="hidden sm:block text-sm font-medium text-[var(--brand)] hover:underline">
                    {t('home.viewAll')}
                  </Link>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6">
                  {featured.map(p => <ProductCard key={p.id} product={p} />)}
                </div>
              </div>
            </section>
          )}

          <section className="max-w-3xl mx-auto px-5 sm:px-8 py-16 sm:py-28 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--accent-dim)] border border-[var(--accent)]/10 mb-6">
              <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--accent)]">{t('home.whyUs')}</span>
            </div>
            <h2 className="text-heading text-[var(--text)] mb-4">{t('home.whyUsTitle')}</h2>
            <p className="text-sm text-[var(--muted)] max-w-lg mx-auto leading-relaxed">
              {t('home.whyUsDesc')}
            </p>
            <Link to="/about" className="inline-flex items-center gap-1.5 mt-8 text-sm font-semibold text-[var(--brand)] hover:text-[var(--hot)] transition-colors">
              {t('home.learnMore')}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </Link>
          </section>
        </>
      )}
    </div>
    </>
  )
}