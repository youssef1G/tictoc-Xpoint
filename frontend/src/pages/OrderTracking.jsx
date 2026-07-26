import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { fetchOrder, cancelOrder } from '../api.js'
import { useLocale } from '../context/LocaleContext.jsx'
import { fadeUp, staggerContainer, staggerItem } from '../lib/animations.js'

const STEPS = [
  { key: 'pending',   labelKey: 'order.placed',   icon: '🛍️' },
  { key: 'confirmed', labelKey: 'order.confirmed', icon: '✅' },
  { key: 'shipped',   labelKey: 'order.outForDelivery', icon: '🚚' },
  { key: 'delivered', labelKey: 'order.delivered', icon: '📦' },
]
const STATUS_IDX = { pending: 0, confirmed: 1, shipped: 2, delivered: 3 }

function formatDate(str) {
  if (!str) return null
  return new Date(str).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}

export default function OrderTracking() {
  const { t } = useLocale()
  const { id } = useParams()
  const egp = (amount) => t('currency.egp', { amount: Number(amount).toFixed(0) })
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [cancelling, setCancelling] = useState(false)

  const load = () => {
    setLoading(true)
    fetchOrder(id)
      .then(setOrder)
      .catch(() => setError(t('tracking.notFound')))
      .finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [id])

  async function handleCancel() {
    if (!window.confirm(t('orders.cancelConfirm'))) return
    setCancelling(true)
    try {
      await cancelOrder(id)
      await load()
    } catch (err) {
      alert(err.message || t('orders.cancelError'))
    } finally {
      setCancelling(false)
    }
  }

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

  const currentIdx = STATUS_IDX[order.status] ?? 0
  const cancelled = order.status === 'cancelled'
  const computedSubtotal = (order.items || []).reduce((sum, i) => sum + Number(i.price) * i.quantity, 0)
  const computedShipping = Math.max(0, Math.round((order.total - computedSubtotal) * 100) / 100)

  return (
    <div className="max-w-2xl mx-auto px-5 sm:px-8 py-10 sm:py-14 space-y-8">
      <motion.div {...fadeUp}>
        <p className="text-xs font-mono text-[var(--muted)] mb-1">{order.id}</p>
        <h1 className="text-heading-lg text-[var(--text)]">{t('tracking.title')}</h1>
      </motion.div>

      {order.estimated_delivery && !cancelled && (
        <motion.div className="surface-card p-5 flex items-center gap-4"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1], delay: 0.1 }}
        >
          <span className="text-2xl">{'📅'}</span>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--brand)]">{t('tracking.estimatedDelivery')}</p>
            <p className="font-heading text-lg font-semibold text-[var(--text)]">{formatDate(order.estimated_delivery)}</p>
          </div>
        </motion.div>
      )}

      {!cancelled ? (
        <motion.div className="surface-card p-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.55, ease: [0.25, 0.1, 0.25, 1], delay: 0.2 }}
        >
          <div className="relative">
            <div className="absolute top-5 left-5 right-5 h-0.5 bg-[var(--border)]" />
            <div className="absolute top-5 left-5 h-0.5 bg-[var(--brand)] transition-all duration-700"
              style={{ width: `${(currentIdx / (STEPS.length - 1)) * 100}%` }} />
            <div className="relative flex justify-between">
              {STEPS.map((step, i) => {
                const done = i <= currentIdx
                const active = i === currentIdx
                return (
                  <div key={step.key} className="flex flex-col items-center gap-2 w-16">
                    <div className={`w-11 h-11 rounded-full flex items-center justify-center text-lg border-2 transition-all ${
                      done ? 'bg-[var(--brand)] border-[var(--brand)] text-white' : 'bg-[var(--surface)] border-[var(--border)] text-[var(--muted)]'
                    }`}>
                      {step.icon}
                    </div>
                    <p className={`text-[11px] text-center leading-tight ${
                      active ? 'text-[var(--brand)] font-semibold' : done ? 'text-[var(--text)]' : 'text-[var(--muted)]'
                    }`}>{step.label}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </motion.div>
      ) : (
        <motion.div className="surface-card p-5 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-2xl mb-2">{'❌'}</p>
          <p className="font-semibold text-[var(--text)]">{t('tracking.cancelled')}</p>
        </motion.div>
      )}

      <motion.div className="surface-card p-5 space-y-4"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.55, ease: [0.25, 0.1, 0.25, 1], delay: 0.3 }}
      >
        <h2 className="font-heading text-base font-semibold text-[var(--text)]">{t('tracking.details')}</h2>
        <div className="grid sm:grid-cols-2 gap-2 text-xs">
          <div>
            <p className="text-[var(--muted)] mb-0.5">{t('tracking.placedOn')}</p>
            <p className="text-[var(--text)]">{formatDate(order.created_at)}</p>
          </div>
          <div>
            <p className="text-[var(--muted)] mb-0.5">{t('tracking.payment')}</p>
            <p className="text-[var(--text)]">{order.type === 'cod' ? t('tracking.cod') : order.type}</p>
          </div>
          <div className="sm:col-span-2">
            <p className="text-[var(--muted)] mb-0.5">{t('tracking.address')}</p>
            <p className="text-[var(--text)]">{order.customer?.address}, {order.customer?.city}</p>
          </div>
        </div>
        <div className="border-t border-[var(--border)] pt-4 space-y-2">
          {(order.items || []).map((item, i) => (
            <div key={i} className="flex justify-between text-xs">
              <span className="text-[var(--muted)]">{item.name} × {item.quantity}</span>
              <span className="text-[var(--text)] font-medium">{egp(item.price * item.quantity)}</span>
            </div>
          ))}
          {computedShipping > 0 && (
            <div className="flex justify-between text-xs text-[var(--muted)]">
              <span>{t('tracking.shipping')}</span>
              <span>{egp(computedShipping)}</span>
            </div>
          )}
          <div className="flex justify-between text-sm font-bold text-[var(--text)] pt-2 border-t border-[var(--border)]">
            <span>{t('tracking.total')}</span>
            <span>{egp(order.total)}</span>
          </div>
        </div>
      </motion.div>

      <motion.div className="flex flex-wrap gap-3"
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, delay: 0.4 }}
      >
        <button onClick={load}
          className="text-xs font-medium text-[var(--muted)] border border-[var(--border)] rounded-full px-4 py-2 hover:text-[var(--text)] transition-colors">
          {t('tracking.refresh')}
        </button>
        <Link to="/my-orders"
          className="text-xs font-medium text-[var(--muted)] border border-[var(--border)] rounded-full px-4 py-2 hover:text-[var(--text)] transition-colors">
          {t('tracking.backOrders')}
        </Link>
        {order.status === 'pending' && (
          <>
            <Link to={`/order/${order.id}/edit`}
              className="text-xs font-medium text-[var(--brand)] border border-[var(--brand)]/30 rounded-full px-4 py-2 hover:bg-[var(--brand-dim)] transition-colors">
              {t('edit.order')}
            </Link>
            <button onClick={handleCancel} disabled={cancelling}
              className="text-xs font-medium text-red-500 border border-red-200 rounded-full px-4 py-2 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50">
              {cancelling ? t('orders.cancelling') : t('orders.cancelOrder')}
            </button>
          </>
        )}
      </motion.div>
    </div>
  )
}