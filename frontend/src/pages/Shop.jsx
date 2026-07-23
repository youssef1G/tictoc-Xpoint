import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { fetchProducts, fetchCategories } from '../api.js'
import ProductCard from '../components/ProductCard.jsx'
import { LoadingState, ErrorState } from '../components/StatusStates.jsx'

export default function Shop() {
  const [products, setProducts]   = useState([])
  const [categories, setCategories] = useState([])
  const [status, setStatus]         = useState('loading')
  const [searchParams, setSearchParams] = useSearchParams()
  const activeCategory = searchParams.get('category') || 'All'

  const load = () => {
    setStatus('loading')
    Promise.all([fetchProducts(), fetchCategories()])
      .then(([prods, cats]) => {
        setProducts(prods)
        setCategories(['All', ...cats])
        setStatus('ready')
      })
      .catch(() => setStatus('error'))
  }
  useEffect(() => { load() }, [])

  const filtered = activeCategory === 'All'
    ? products
    : products.filter(p => p.category === activeCategory)

  if (status === 'loading') return <LoadingState label="Loading products..." />
  if (status === 'error') return <ErrorState message="Couldn't load products." onRetry={load} />

  return (
    <div className="max-w-7xl mx-auto px-5 sm:px-8 py-10 sm:py-14">
      <div className="mb-8">
        <h1 className="text-display text-[var(--text)] mb-1">Shop</h1>
        <p className="text-sm text-[var(--muted)]">Browse our full collection.</p>
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
            {cat}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-24">
          <p className="text-[var(--muted)]">No products in this category yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6">
          {filtered.map(p => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  )
}