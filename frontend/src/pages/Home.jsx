import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Zap, Headphones, Smartphone, Watch, Plug, Cable, BatteryCharging, ShieldCheck, Music2, Car, Gamepad2, Package, ArrowRight, ChevronRight, Truck, MessageCircle, RotateCcw } from 'lucide-react'
import { fetchProducts } from '../api.js'
import ProductCard from '../components/ProductCard.jsx'
import { LoadingState, ErrorState } from '../components/StatusStates.jsx'
import { useLocale } from '../context/LocaleContext.jsx'

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

      {/* Logo */}
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

  const categories = [...new Set(products.map(p => p.category))].slice(0, 6)
  const featured = [...products.filter(p => p.tag === 'Bestseller'), ...products.filter(p => p.tag === 'New')].slice(0, 4)

  const categoryStore = {}
  const categoryCount = {}
  products.forEach(p => {
    const store = p.store || 'xpoint'
    if (!categoryStore[p.category]) categoryStore[p.category] = new Set()
    categoryStore[p.category].add(store)
    categoryCount[p.category] = (categoryCount[p.category] || 0) + 1
  })

  return (
    <div>
      {/* ── Hero ────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-[var(--border)]">
        {/* Brand glow aura */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-[var(--brand)]/[0.04] blur-3xl pointer-events-none animate-glow" style={{ animationDuration: '4s' }} />
        <div className="absolute top-1/3 right-0 w-[350px] h-[350px] rounded-full bg-[var(--accent)]/[0.03] blur-3xl pointer-events-none animate-glow" style={{ animationDuration: '5s', animationDelay: '1s' }} />

        <div className="relative max-w-7xl mx-auto px-5 sm:px-8 pt-8 pb-10 sm:pt-12 sm:pb-14 lg:pt-14 lg:pb-16 grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Text */}
          <div className="order-2 lg:order-1">
            <div className="animate-fade-up inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--brand-dim)] border border-[var(--brand)]/15 mb-5 relative overflow-hidden">
              {/* Shimmer sweep */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent bg-[length:200%_100%] animate-shimmer pointer-events-none" />
              <img src="/logo.jpg" alt="" className="w-4 h-4 rounded object-cover relative" />
              <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--brand)] relative">
                {t('brand.tictoc')} &middot; {t('brand.xpoint')}
              </span>
            </div>

            <h1
              className="animate-fade-up font-heading text-[1.75rem] sm:text-[2.25rem] lg:text-[3rem] font-bold leading-[1.04] tracking-[-0.03em] text-[var(--text)] mb-4"
              style={{ animationDelay: '0.1s' }}
              dangerouslySetInnerHTML={{ __html: t('home.heroTitle') }}
            />

            <p className="animate-fade-up text-sm sm:text-[14px] text-[var(--muted)] max-w-md leading-relaxed" style={{ animationDelay: '0.18s' }}>
              {t('home.heroDescXpoint', { brand: t('brand.xpoint') })}
              <br className="hidden sm:block" />
              {t('home.heroDescTictoc', { brand: t('brand.tictoc') })}
            </p>

            <div className="animate-fade-up mt-7 flex flex-wrap gap-3" style={{ animationDelay: '0.26s' }}>
              <Link to="/shop" className="btn-primary px-6 py-3 text-[14px] gap-2 shadow-sm group">
                {t('home.exploreStores')}
                <ArrowRight size={15} strokeWidth={2.5} className="animate-slide-arrow" />
              </Link>
              <Link to="/about" className="btn-secondary px-6 py-3 text-[14px]">
                {t('home.ourStory')}
              </Link>
            </div>
          </div>

          {/* Visual */}
          <div className="order-1 lg:order-2 animate-fade-in min-h-[260px] sm:min-h-[320px] lg:min-h-[380px] flex items-center justify-center" style={{ animationDelay: '0.15s' }}>
            <HeroIllustration />
          </div>
        </div>
      </section>

      {/* ── Loading / Error ─────────────────── */}
      {status === 'loading' && <LoadingState label={t('home.loading')} />}
      {status === 'error' && <ErrorState message={t('home.loadError')} onRetry={load} />}

      {/* ── Ready content ───────────────────── */}
      {status === 'ready' && (
        <>
          {/* Categories */}
          {categories.length > 0 && (
              <section className="max-w-7xl mx-auto px-5 sm:px-8 py-16 sm:py-24">
              <div className="flex items-end justify-between mb-10">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--muted)] mb-3">{t('home.browse')}</p>
                  <h2 className="font-heading text-[1.75rem] sm:text-[2rem] font-semibold text-[var(--text)] tracking-[-0.015em]">{t('home.shopByCategory')}</h2>
                </div>
                <Link to="/shop" className="hidden sm:inline-flex text-sm font-semibold text-[var(--brand)] hover:text-[var(--hot)] transition-colors">
                  {t('home.viewAll')}
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {categories.map((cat, idx) => {
                  const isHiddenOnMobile = idx >= 4
                  const CategoryIcon = CATEGORY_ICONS[cat] || Package
                  const stores = categoryStore[cat]
                  const singleStore = stores && stores.size === 1 ? [...stores][0] : null
                  const count = categoryCount[cat] || 0
                  const isXpoint = singleStore === 'xpoint'
                  const isTictoc = singleStore === 'tictoc'

                  const to = singleStore
                    ? `/shop/${singleStore}?category=${encodeURIComponent(cat)}`
                    : `/shop`

return (
                      <Link
                        key={cat}
                        to={to}
                        className={`${isHiddenOnMobile ? 'hidden sm:flex' : 'flex'} group relative items-center gap-5 surface-card p-5 sm:px-6 sm:py-5 transition-all duration-300 hover:border-[var(--brand)]/40 hover:shadow-card-h hover:-translate-y-0.5`}
                      >
                        {/* Icon */}
                        <div className="relative w-12 h-12 shrink-0 rounded-2xl flex items-center justify-center transition-all duration-300"
                          style={{
                            background: isXpoint
                              ? 'color-mix(in srgb, var(--accent) 10%, transparent)'
                              : 'var(--brand-dim)',
                          }}>
                          <CategoryIcon size={20} strokeWidth={1.5}
                            style={{ color: isXpoint ? 'var(--accent)' : 'var(--brand)' }} />
                        </div>

                      {/* Label */}
                      <div className="min-w-0 flex-1">
                        <span className="inline-flex items-center gap-1.5 min-w-0 flex-1">
                          <span className="text-[14px] sm:text-[15px] font-semibold text-[var(--text)] leading-tight truncate transition-colors group-hover:text-[var(--brand)]">
                            {t('cat.' + cat) || cat}
                          </span>
                          <span className="text-[11px] text-[var(--muted)] font-medium shrink-0">{count}</span>
                        </span>
                      </div>

                      {/* Store badge */}
                      {singleStore && (
<span className="hidden sm:inline-block text-[10px] font-semibold uppercase tracking-[0.08em] rounded-full px-2.5 py-1 shrink-0"
                            style={{
                              color: isXpoint ? 'var(--accent)' : 'var(--brand)',
                              background: isXpoint
                                ? 'color-mix(in srgb, var(--accent) 8%, transparent)'
                                : 'var(--brand-dim)',
                              border: singleStore
                                ? `1px solid ${isXpoint ? 'color-mix(in srgb, var(--accent) 20%, transparent)' : 'var(--brand)/20'}`
                                : 'none',
                            }}>
                            {singleStore === 'tictoc' ? t('brand.tictoc') : t('brand.xpoint')}
                          </span>
                      )}

                      {/* Hover arrow */}
                      <ChevronRight
                        size={16} strokeWidth={2}
                        className="hidden sm:block shrink-0 text-[var(--muted)]/0 group-hover:text-[var(--brand)] transition-all duration-300 -translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100"
                      />
                    </Link>
                  )
                })}
              </div>
            </section>
          )}

          {/* Featured products */}
          {featured.length > 0 && (
              <section className="bg-[var(--muted)]/5 border-y border-[var(--border)] py-16 sm:py-24">
              <div className="max-w-7xl mx-auto px-5 sm:px-8">
                <div className="flex items-end justify-between mb-10">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--muted)] mb-3">{t('home.popular')}</p>
                    <h2 className="font-heading text-[1.75rem] sm:text-[2rem] font-semibold text-[var(--text)] tracking-[-0.015em]">{t('home.bestsellers')}</h2>
                  </div>
                  <Link to="/shop" className="hidden sm:inline-flex text-sm font-semibold text-[var(--brand)] hover:text-[var(--hot)] transition-colors">
                    {t('home.viewAll')}
                  </Link>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6">
                  {featured.map(p => <ProductCard key={p.id} product={p} />)}
                </div>
              </div>
            </section>
          )}

          {/* Brand story CTA */}
            <section className="relative overflow-hidden border-y border-[var(--border)] bg-[var(--muted)]/[0.03] py-16 sm:py-24">
            <div className="max-w-6xl mx-auto px-5 sm:px-8">
              <div className="text-center mb-14">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--accent-dim)] border border-[var(--accent)]/10 mb-6">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--accent)]">{t('home.whyUs')}</span>
                </div>
                <h2 className="font-heading text-[1.75rem] sm:text-[2rem] font-semibold text-[var(--text)] tracking-[-0.015em] mb-4">{t('home.whyUsTitle')}</h2>
                <p className="text-[15px] text-[var(--muted)] max-w-lg mx-auto leading-relaxed">
                  {t('home.whyUsDesc')}
                </p>
              </div>

              <div className="grid sm:grid-cols-3 gap-4 sm:gap-6 max-w-4xl mx-auto">
                {[
                  { Icon: ShieldCheck, titleKey: 'home.featureQuality', descKey: 'home.featureQualityDesc' },
                  { Icon: Truck, titleKey: 'home.featureShipping', descKey: 'home.featureShippingDesc' },
                  { Icon: MessageCircle, titleKey: 'home.featureSupport', descKey: 'home.featureSupportDesc' },
                ].map(({ Icon, titleKey, descKey }) => (
                    <div key={titleKey} className="surface-card p-6 sm:p-8 text-center">
                    <div className="w-12 h-12 rounded-2xl bg-[var(--brand-dim)] flex items-center justify-center mx-auto mb-5">
                      <Icon size={22} strokeWidth={1.5} className="text-[var(--brand)]" />
                    </div>
                    <h3 className="font-heading text-sm font-bold text-[var(--text)] mb-2">{t(titleKey)}</h3>
                    <p className="text-[13px] text-[var(--muted)] leading-relaxed">{t(descKey)}</p>
                  </div>
                ))}
              </div>

              <div className="text-center mt-12">
                <Link to="/about" className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--brand)] hover:text-[var(--hot)] transition-colors">
                  {t('home.learnMore')}
                  <ArrowRight size={14} strokeWidth={2.5} />
                </Link>
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  )
}