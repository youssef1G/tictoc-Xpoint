import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import { fetchOrder, fetchProducts, updateOrderItems } from '../api.js'
import { useLocale } from '../context/LocaleContext.jsx'
import { fadeUp } from '../lib/animations.js'

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:4242'

export default function EditOrder() {
  const { t } = useLocale()
  const { id } = useParams()
  const navigate = useNavigate()
  const egp = (amount) => t('currency.egp', { amount: Number(amount).toFixed(0) })

  const [order, setOrder] = useState(null)
  const [products, setProducts] = useState([])
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [shippingFee, setShippingFee] = useState(0)
  const [freeThreshold, setFreeThreshold] = useState(0)
  const [baseShipping, setBaseShipping] = useState(0)
  const [settingsLoaded, setSettingsLoaded] = useState(false)

  useEffect(() => {
    Promise.all([
      fetchOrder(id),
      fetchProducts(),
      fetch(`${BASE}/api/settings/public`).then(r => r.json()).catch(() => []),
    ]).then(([orderData, allProducts, settings]) => {
      if (!orderData) { setError(t('tracking.notFound')); return }

      const shipping = settings.find(s => s.key === 'shipping')
      const threshold = settings.find(s => s.key === 'free_shipping_threshold')
      const tVal = threshold ? Math.max(0, Number(threshold.value) || 0) : 0
      const sVal = shipping ? Math.max(0, Number(shipping.value) || 0) : 0
      setFreeThreshold(tVal)
      setBaseShipping(sVal)
      setSettingsLoaded(true)

      const productMap = {}
      for (const p of allProducts) productMap[p.id] = p

      const merged = (orderData.items || []).map(item => {
        const prod = productMap[item.productId] || {}
        return {
          productId: item.productId,
          name: item.name,
          price: Number(item.price),
          quantity: item.quantity,
          image: prod.image || (prod.images && prod.images[0]) || '',
          stock: prod.stock,
        }
      })

      setOrder(orderData)
      setProducts(allProducts)
      setItems(merged)
      setLoading(false)
    }).catch(() => { setError(t('tracking.notFound')); setLoading(false) })
  }, [id])

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0)
  const shipping = settingsLoaded
    ? (freeThreshold > 0 && subtotal >= freeThreshold ? 0 : baseShipping)
    : 0
  const total = subtotal + shipping

  function updateQty(productId, delta) {
    setItems(prev => prev.map(item => {
      if (item.productId !== productId) return item
      const maxQty = item.stock != null ? item.stock : Infinity
      return { ...item, quantity: Math.max(1, Math.min(item.quantity + delta, maxQty)) }
    }))
  }

  function removeItem(productId) {
    setItems(prev => prev.filter(i => i.productId !== productId))
  }

  function addToItems(productId) {
    const prod = products.find(p => p.id === productId)
    if (!prod) return
    setItems(prev => {
      const existing = prev.find(i => i.productId === productId)
      if (existing) return prev.map(i => i.productId === productId ? { ...i, quantity: i.quantity + 1 } : i)
      return [...prev, {
        productId: prod.id,
        name: prod.name,
        price: Number(prod.price),
        quantity: 1,
        image: prod.image || (prod.images && prod.images[0]) || '',
        stock: prod.stock,
      }]
    })
  }

  async function handleSave() {
    if (items.length === 0) return
    setSaving(true)
    setError('')
    try {
      await updateOrderItems(id, items.map(i => ({ productId: i.productId, quantity: i.quantity })))
      navigate(`/order/${id}`)
    } catch (err) {
      setError(err.message || 'Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  const availableProducts = products.filter(p =>
    !items.some(i => i.productId === p.id) &&
    (p.stock === null || p.stock > 0) &&
    (!search || p.name.toLowerCase().includes(search.toLowerCase()))
  )

  if (loading) return (
    <div className="flex justify-center py-24">
      <div className="w-5 h-5 border-2 border-[var(--brand)] border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (error || !order) return (
    <div className="max-w-md mx-auto px-5 py-24 text-center">
      <p className="text-sm text-[var(--muted)] mb-4">{error || t('tracking.notFound')}</p>
      <Link to="/my-orders" className="text-xs font-medium text-[var(--brand)] hover:underline">{t('tracking.backOrders')}</Link>
    </div>
  )

  if (order.status !== 'pending') return (
    <div className="max-w-md mx-auto px-5 py-24 text-center">
      <p className="text-sm text-[var(--muted)] mb-4">{t('edit.cantEdit')}</p>
      <Link to={`/order/${order.id}`} className="text-xs font-medium text-[var(--brand)] hover:underline">{t('edit.backToTracking')}</Link>
    </div>
  )

  return (
    <div className="max-w-5xl mx-auto px-5 sm:px-8 py-10 sm:py-14">
      <motion.nav className="flex items-center gap-2 text-xs text-[var(--muted)] mb-8 flex-wrap"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
        <Link to={`/order/${order.id}`} className="hover:text-[var(--brand)]">{t('tracking.title')}</Link>
        <span>/</span>
        <span className="text-[var(--text)]">{t('edit.title')}</span>
      </motion.nav>

      <div className="grid lg:grid-cols-5 gap-10">
        <div className="lg:col-span-3 space-y-8">
          <motion.div className="surface-card p-5 sm:p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <h2 className="font-heading text-lg font-semibold text-[var(--text)] mb-4">{t('edit.yourItems')}</h2>

            {items.length === 0 ? (
              <p className="text-sm text-[var(--muted)] py-6 text-center">{t('edit.noItems')}</p>
            ) : (
              <ul className="space-y-4">
                {items.map(item => {
                  const maxQty = item.stock != null ? item.stock : Infinity
                  return (
                    <li key={item.productId} className="flex items-center gap-3 p-3 -mx-3 rounded-xl hover:bg-[var(--brand-dim)]/30 transition-colors">
                      <img src={item.image || '/placeholder.svg'} alt={item.name}
                        className="w-14 h-14 rounded-xl object-cover border border-[var(--border)] shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-[var(--text)] truncate">{item.name}</p>
                        <p className="text-xs text-[var(--muted)]">{egp(item.price)} each</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <div className="flex items-center rounded-full border border-[var(--border)]">
                          <button onClick={() => updateQty(item.productId, -1)}
                            className="h-8 w-8 flex items-center justify-center text-xs text-[var(--text)] hover:bg-[var(--muted)]/10 rounded-l-full transition-colors">−</button>
                          <span className="w-8 text-center text-xs font-medium">{item.quantity}</span>
                          <button onClick={() => updateQty(item.productId, 1)} disabled={item.quantity >= maxQty}
                            className="h-8 w-8 flex items-center justify-center text-xs text-[var(--text)] hover:bg-[var(--muted)]/10 rounded-r-full transition-colors disabled:opacity-40">+</button>
                        </div>
                        <span className="text-xs font-semibold text-[var(--text)] w-16 text-right">{egp(item.price * item.quantity)}</span>
                        <button onClick={() => removeItem(item.productId)}
                          className="text-xs text-red-400 hover:text-red-500 transition-colors p-1" aria-label={t('edit.removeItem')}>
                          ✕
                        </button>
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
          </motion.div>

          <motion.div className="surface-card p-5 sm:p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1], delay: 0.1 }}
          >
            <h2 className="font-heading text-base font-semibold text-[var(--text)] mb-3">{t('edit.addProducts')}</h2>
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder={t('edit.searchProducts')}
              className="w-full rounded-full border border-[var(--border)] px-5 py-2.5 text-sm bg-[var(--surface)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--brand)] mb-3" />
            <div className="max-h-64 overflow-y-auto space-y-1">
              {availableProducts.length === 0 ? (
                <p className="text-xs text-[var(--muted)] text-center py-4">{search ? t('edit.noMatch') : t('edit.allAdded')}</p>
              ) : availableProducts.map(p => (
                <div key={p.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-[var(--brand-dim)]/30 transition-colors">
                  <img src={p.image || (p.images && p.images[0]) || '/placeholder.svg'} alt={p.name}
                    className="w-10 h-10 rounded-lg object-cover border border-[var(--border)] shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-[var(--text)] truncate">{p.name}</p>
                    <p className="text-[11px] text-[var(--muted)]">{egp(p.price)}</p>
                  </div>
                  <button onClick={() => addToItems(p.id)}
                    className="text-xs font-semibold text-[var(--brand)] border border-[var(--brand)]/30 rounded-full px-3 py-1 hover:bg-[var(--brand-dim)] transition-colors shrink-0">
                    {t('edit.add')}
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        <div className="lg:col-span-2">
          <motion.div className="sticky top-24 surface-card p-6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.55, ease: [0.25, 0.1, 0.25, 1], delay: 0.15 }}
          >
            <h2 className="font-heading text-lg font-semibold text-[var(--text)] mb-4">{t('edit.summary')}</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-xs text-[var(--muted)]">
                <span>{t('edit.itemsCount', { count: items.reduce((s, i) => s + i.quantity, 0), s: items.reduce((s, i) => s + i.quantity, 0) !== 1 ? 's' : '' })}</span>
              </div>
              <div className="flex justify-between text-xs text-[var(--muted)]">
                <span>{t('checkout.subtotal')}</span>
                <span>{egp(subtotal)}</span>
              </div>
              <div className="flex justify-between text-xs text-[var(--muted)]">
                <span>{t('checkout.shipping')}</span>
                <span>{settingsLoaded
                  ? (shipping > 0 ? egp(shipping)
                    : freeThreshold > 0 && subtotal >= freeThreshold ? `${t('checkout.free')} 🎉`
                    : t('checkout.free'))
                  : '...'}</span>
              </div>
              {settingsLoaded && freeThreshold > 0 && shipping > 0 && (
                <p className="text-[11px] text-amber-600 dark:text-amber-400">
                  {t('checkout.freeShippingThreshold', { threshold: freeThreshold.toFixed(0) })}
                </p>
              )}
              <div className="flex justify-between font-heading text-[var(--text)] pt-3 border-t border-[var(--border)]">
                <span>{t('checkout.total')}</span>
                <span className="font-bold text-lg">{egp(total)}</span>
              </div>
            </div>

            {error && (
              <p className="mt-4 text-xs text-red-500 bg-red-50 dark:bg-red-900/20 border border-red-200 rounded-xl px-4 py-3">{error}</p>
            )}

            <div className="mt-6 space-y-3">
              <button onClick={handleSave} disabled={saving || items.length === 0}
                className="btn-primary w-full py-3 text-sm disabled:opacity-50">
                {saving ? t('edit.saving') : t('edit.save')}
              </button>
              <Link to={`/order/${order.id}`}
                className="block w-full text-center btn-secondary py-3 text-sm">
                {t('edit.cancel')}
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
