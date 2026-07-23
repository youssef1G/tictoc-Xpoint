import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext.jsx'
import { useLocale } from '../context/LocaleContext.jsx'

export default function ProductCard({ product }) {
  const { addToCart, setIsCartOpen } = useCart()
  const { t } = useLocale()
  const outOfStock = product.stock !== null && product.stock !== undefined && product.stock === 0
  const thumbnail = product.images?.[0] || product.image

  return (
    <div className="group flex flex-col">
      <Link to={`/product/${product.id}`}
        className={`relative block overflow-hidden rounded-2xl bg-[var(--muted)]/5 aspect-square ${outOfStock ? '' : 'cursor-pointer'}`}>
        <img
          src={thumbnail}
          alt={product.name}
          loading="lazy"
          className={`h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04] ${outOfStock ? 'opacity-50 grayscale' : ''}`}
        />

        {outOfStock && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-semibold uppercase tracking-[0.1em] bg-[var(--text)]/80 text-[var(--bg)] px-4 py-1.5 rounded-full">
              {t('product.outOfStock')}
            </span>
          </div>
        )}

        {!outOfStock && product.tag && (
          <span className="absolute top-3 left-3 text-[10px] font-semibold uppercase tracking-[0.08em] bg-[var(--brand)] text-white px-2.5 py-1 rounded-md">
            {product.tag}
          </span>
        )}

        {!outOfStock && (
          <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); addToCart(product, 1); setIsCartOpen(true) }}
              className="h-9 w-9 rounded-full bg-[var(--surface)] border border-[var(--border)] shadow-lg flex items-center justify-center text-[var(--text)] hover:bg-[var(--brand)] hover:text-white hover:border-[var(--brand)] transition-all duration-200"
              aria-label={t('product.addToCart', { name: product.name })}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M12 5v14M5 12h14" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        )}
      </Link>

      <div className="mt-3 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <Link to={`/product/${product.id}`}
            className="text-sm font-semibold text-[var(--text)] hover:text-[var(--brand)] transition-colors line-clamp-1 block">
            {product.name}
          </Link>
          <p className="text-[11px] text-[var(--muted)] mt-0.5">{product.category}</p>
        </div>
        <span className="text-sm font-semibold text-[var(--text)] whitespace-nowrap">
          EGP {Number(product.price).toFixed(0)}
        </span>
      </div>
    </div>
  )
}