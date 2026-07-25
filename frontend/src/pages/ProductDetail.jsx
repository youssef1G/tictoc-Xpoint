import { useEffect, useState } from 'react'
import { useParams, Link, Navigate } from 'react-router-dom'
import { motion } from 'motion/react'
import { fetchProduct, fetchProducts } from '../api.js'
import { useCart } from '../context/CartContext.jsx'
import ProductCard from '../components/ProductCard.jsx'
import ProductGallery from '../components/ProductGallery.jsx'
import { LoadingState, ErrorState } from '../components/StatusStates.jsx'
import { useLocale } from '../context/LocaleContext.jsx'
import { fadeUp, staggerContainer, staggerItem } from '../lib/animations.js'

export default function ProductDetail() {
  const { id } = useParams()
  const { addToCart, setIsCartOpen } = useCart()
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)
  const [product, setProduct] = useState(null)
  const [related, setRelated] = useState([])
  const [status, setStatus] = useState('loading')
  const { t } = useLocale()

  const load = () => {
    setStatus('loading'); setProduct(null)
    fetchProduct(id)
      .then(data => {
        setProduct(data)
        return fetchProducts().then(all =>
          setRelated(all.filter(p => p.category === data.category && p.id !== data.id).slice(0, 4))
        )
      })
      .then(() => setStatus('ready'))
      .catch(err => setStatus(err.message?.includes('not found') ? 'not-found' : 'error'))
  }
  useEffect(() => { load() }, [id])
  useEffect(() => { setQuantity(1) }, [id])

  if (status === 'not-found') return <Navigate to="/shop" replace />
  if (status === 'loading') return <LoadingState label={t('productDetail.loading')} />
  if (status === 'error' || !product) return <ErrorState message={t('productDetail.loadError')} onRetry={load} />

  const outOfStock = product.stock !== null && product.stock !== undefined && product.stock === 0
  const lowStock = product.stock !== null && product.stock !== undefined && product.stock > 0 && product.stock <= 5
  const maxQty = product.stock != null ? product.stock : Infinity

  const handleAdd = () => {
    if (outOfStock) return
    addToCart(product, quantity)
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  return (
    <div className="max-w-7xl mx-auto px-5 sm:px-8 py-10 sm:py-14">
      <motion.nav className="flex items-center gap-2 text-xs text-[var(--muted)] mb-8"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
        <Link to="/shop" className="hover:text-[var(--brand)]">{t('productDetail.shop')}</Link>
        <span>/</span>
        <Link to={`/shop?category=${encodeURIComponent(product.category)}`} className="hover:text-[var(--brand)]">{t('cat.' + product.category) || product.category}</Link>
        <span>/</span>
        <span className="text-[var(--text)]">{product.name}</span>
      </motion.nav>

      <div className="grid md:grid-cols-2 gap-10 sm:gap-16">
        <motion.div className="relative"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1], delay: 0.1 }}
        >
          <ProductGallery images={product.images} image={product.image} name={product.name} />
          {outOfStock ? (
            <div className="absolute top-4 left-4 bg-[var(--text)]/80 text-[var(--bg)] text-xs font-semibold uppercase tracking-[0.08em] px-4 py-1.5 rounded-full backdrop-blur-sm">
              {t('productDetail.outOfStock')}
            </div>
          ) : product.tag ? (
            <span className="absolute top-4 left-4 bg-[var(--brand)] text-white text-xs font-semibold uppercase tracking-[0.08em] px-3 py-1 rounded-lg">
              {product.tag}
            </span>
          ) : null}
        </motion.div>

        <motion.div className="flex flex-col justify-start"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1], delay: 0.2 }}
        >
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted)] mb-2">{product.category}</p>
          <h1 className="text-display text-[var(--text)]">{product.name}</h1>
          <p className="text-2xl font-bold text-[var(--text)] mt-3">
            {t('currency.egp', { amount: Number(product.price).toFixed(0) })}
          </p>

          {lowStock && !outOfStock && (
            <p className="mt-2 text-xs font-medium text-amber-600">{t('productDetail.inStock', { count: product.stock })}</p>
          )}
          {outOfStock && (
            <p className="mt-2 text-xs font-medium text-[var(--muted)]">{t('productDetail.currentlyOutOfStock')}</p>
          )}

          <p className="mt-5 text-sm text-[var(--muted)] leading-relaxed">{product.description}</p>

          {product.details?.length > 0 && (
            <ul className="mt-6 space-y-2">
              {product.details.map(d => (
                <li key={d} className="flex items-start gap-2 text-sm text-[var(--muted)]">
                  <span className="mt-1.5 h-1 w-1 rounded-full bg-[var(--muted)] shrink-0" />
                  {d}
                </li>
              ))}
            </ul>
          )}

          <div className="mt-8 flex items-center gap-4">
            <div className={`flex items-center rounded-full border ${outOfStock ? 'border-[var(--border)] opacity-40' : 'border-[var(--border)]'}`}>
              <button onClick={() => setQuantity(q => Math.max(1, q - 1))} disabled={outOfStock}
                className="h-11 w-11 flex items-center justify-center text-[var(--text)] hover:bg-[var(--muted)]/10 rounded-l-full transition-colors disabled:cursor-not-allowed"
                aria-label={t('productDetail.decrease', { name: product.name })}>−</button>
              <span className="w-10 text-center text-sm font-medium">{quantity}</span>
              <button onClick={() => setQuantity(q => Math.min(q + 1, maxQty))} disabled={outOfStock || quantity >= maxQty}
                className="h-11 w-11 flex items-center justify-center text-[var(--text)] hover:bg-[var(--muted)]/10 rounded-r-full transition-colors disabled:cursor-not-allowed disabled:opacity-40"
                aria-label={t('productDetail.increase', { name: product.name })}>+</button>
            </div>
            <button onClick={handleAdd} disabled={outOfStock}
              className={`flex-1 rounded-full font-semibold py-3 text-sm transition-all ${
                outOfStock
                  ? 'bg-[var(--muted)]/10 text-[var(--muted)] cursor-not-allowed'
                  : 'btn-primary py-3'
              }`}>
              {outOfStock ? t('productDetail.outOfStock') : added ? t('productDetail.added') : t('productDetail.addToCart')}
            </button>
          </div>

          {!outOfStock && (
            <button onClick={() => { addToCart(product, quantity); setIsCartOpen(true) }}
              className="mt-3 w-full rounded-full border border-[var(--brand)] text-[var(--brand)] font-semibold py-3 text-sm hover:bg-[var(--brand-dim)] transition-colors">
              {t('productDetail.viewCart')}
            </button>
          )}
        </motion.div>
      </div>

      {related.length > 0 && (
        <motion.section className="mt-20 sm:mt-28" {...fadeUp}>
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[var(--muted)] mb-1">{t('productDetail.related')}</p>
              <h2 className="text-heading-lg text-[var(--text)]">{t('productDetail.alsoLike')}</h2>
            </div>
          </div>
          <motion.div
            className="grid grid-cols-2 sm:grid-cols-4 gap-5 sm:gap-6"
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.1 }}
          >
            {related.map(p => (
              <motion.div key={p.id} variants={staggerItem}>
                <ProductCard product={p} />
              </motion.div>
            ))}
          </motion.div>
        </motion.section>
      )}
    </div>
  )
}