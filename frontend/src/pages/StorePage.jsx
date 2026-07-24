import { useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { fetchProducts, fetchCategories } from '../api.js'
import ProductCard from '../components/ProductCard.jsx'
import { LoadingState, ErrorState } from '../components/StatusStates.jsx'
import { getStore } from '../data/constants.js'
import { useLocale } from '../context/LocaleContext.jsx'
import Seo from '../components/Seo.jsx'

export default function StorePage() {
  const { t } = useLocale()
  const { store: storeSlug } = useParams()
  const store = getStore(storeSlug)
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [status, setStatus] = useState('loading')
  const [searchParams, setSearchParams] = useSearchParams()
  const activeCategory = searchParams.get('category') || 'All'

  const load = () => {
    setStatus('loading')
    Promise.all([fetchProducts(storeSlug), fetchCategories(storeSlug)])
      .then(([prods, cats]) => {
        setProducts(prods)
        setCategories(['All', ...cats])
        setStatus('ready')
      })
      .catch(() => setStatus('error'))
  }
  useEffect(() => { load() }, [storeSlug])

  const filtered = activeCategory === 'All'
    ? products
    : products.filter(p => p.category === activeCategory)

  if (!store) {
    return (
      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-24 text-center">
        <p className="text-[var(--muted)]">{t('store.notFound')}</p>
      </div>
    )
  }

  if (status === 'loading') return <LoadingState label={t('store.loading')} />
  if (status === 'error') return <ErrorState message={t('store.loadError')} onRetry={load} />

  return (
    <>
      <Seo title={t('seo.title.' + store.slug)} description={t('seo.desc.' + store.slug)} />
      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-10 sm:py-14">
      <div className="mb-8">
        <h1 className="text-display text-[var(--text)] mb-1">{store.slug === 'xpoint' ? t('brand.xpoint') : t('brand.tictoc')}</h1>
        <p className="text-sm text-[var(--muted)]">{t('store.subtitle.' + store.slug)}</p>
      </div>

      <div className="flex flex-wrap gap-2 mb-10">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSearchParams(cat === 'All' ? {} : { category: cat })}
            className={`rounded-full px-4 py-2 text-[13px] font-medium transition-all duration-200 ${
              activeCategory === cat
                ? 'bg-[var(--brand)] text-white shadow-sm'
                : 'border border-[var(--border)] text-[var(--muted)] hover:border-[var(--brand)] hover:text-[var(--brand)] bg-[var(--surface)]'
            }`}
          >
            {cat === 'All' ? t('store.all') : t('cat.' + cat) || cat}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-24">
          <p className="text-[var(--muted)]">{t('store.noProducts')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6">
          {filtered.map(p => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
    </>
  )
}