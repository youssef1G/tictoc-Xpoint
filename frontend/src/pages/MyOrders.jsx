import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { fetchOrdersByPhone, fetchOrder, submitReturn, cancelOrder } from '../api.js'
import CustomSelect from '../components/CustomSelect.jsx'
import { useLocale } from '../context/LocaleContext.jsx'
import { fadeUp, staggerContainer, staggerItem } from '../lib/animations.js'

const STATUS_STYLE = {
  pending:   'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800',
  confirmed: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800',
  shipped:   'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800',
  delivered: 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800',
  cancelled: 'bg-gray-50 text-gray-500 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700',
}

function ReturnForm({ orderId, onClose, onSuccess }) {
  const { t } = useLocale()
  const RETURN_REASONS = [
    { value: t('orders.returnDamagedValue'), label: t('orders.returnDamaged') },
    { value: t('orders.returnWrongValue'), label: t('orders.returnWrong') },
    { value: t('orders.returnNotDescribedValue'), label: t('orders.returnNotDescribed') },
    { value: t('orders.returnMind'), label: t('orders.returnMind') },
    { value: t('orders.returnOther'), label: t('orders.returnOther') },
  ]
  const [step, setStep]       = useState(1)
  const [reason, setReason]   = useState('')
  const [details, setDetails] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError]     = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const result = await submitReturn({ order_id: orderId, reason, details })
      if (onSuccess) onSuccess(result.id)
      setSuccess(true)
    } catch (err) {
      setError(err.status === 409 ? t('orders.returnAlreadyExists') : (err.message || 'Something went wrong.'))
    } finally {
      setLoading(false)
    }
  }

  if (success) return (
    <div className="mt-4 surface-card p-5 text-center">
      <p className="text-2xl mb-2">{'✅'}</p>
      <p className="text-sm font-semibold text-green-700 dark:text-green-400">{t('orders.returnSubmitted')}</p>
      <p className="text-xs text-green-600 dark:text-green-500 mt-1">{t('orders.returnSubmittedDesc')}</p>
    </div>
  )

  return (
    <div className="mt-4 surface-card p-5 space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-heading font-semibold text-[var(--text)]">{t('orders.returnHeading')}</p>
        <div className="flex gap-1.5">
          {[1, 2].map(s => (
            <div key={s} className={`h-1.5 w-5 rounded-full transition-colors ${s <= step ? 'bg-[var(--brand)]' : 'bg-[var(--border)]'}`} />
          ))}
        </div>
      </div>

      {step === 1 && (
        <div className="space-y-3">
          <p className="text-xs text-[var(--muted)]">{t('orders.returnWhy')}</p>
          <div className="space-y-2">
            {RETURN_REASONS.map(r => (
              <button key={r.value} type="button" onClick={() => setReason(r.value)}
                className={[
                  'w-full text-left px-4 py-3 rounded-xl border text-sm transition-colors',
                  reason === r.value
                    ? 'border-[var(--brand)] bg-[var(--brand-dim)] text-[var(--brand)] font-medium'
                    : 'border-[var(--border)] text-[var(--muted)] hover:border-[var(--brand)]/30',
                ].join(' ')}>
                {r.label}
              </button>
            ))}
          </div>
          <button type="button" disabled={!reason} onClick={() => setStep(2)}
            className="btn-primary w-full text-sm disabled:opacity-40">
            {t('orders.returnContinue')}
          </button>
        </div>
      )}

      {step === 2 && (
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex items-center gap-2 bg-[var(--brand-dim)] border border-[var(--brand)]/10 rounded-xl px-3 py-2">
            <span className="text-xs text-[var(--brand)] font-medium">{RETURN_REASONS.find(r => r.value === reason)?.label}</span>
            <button type="button" onClick={() => setStep(1)} className="ml-auto text-xs text-[var(--muted)] hover:text-[var(--brand)] transition-colors">{t('orders.returnChange')}</button>
          </div>
          <div>
            <label className="block text-xs text-[var(--muted)] mb-1.5">
              {t('orders.returnDetails')} <span className="text-[var(--muted)]/50">{t('orders.returnOptional')}</span>
            </label>
            <textarea value={details} onChange={e => setDetails(e.target.value)} rows={3}
              placeholder={t('orders.returnPlaceholder')}
              className="w-full rounded-xl border border-[var(--border)] px-4 py-3 text-sm bg-[var(--surface)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--brand)] resize-none" />
          </div>
          {error && <p className="text-xs text-red-500">{error}</p>}
          <div className="flex gap-2">
            <button type="submit" disabled={loading}
              className="btn-primary flex-1 text-sm disabled:opacity-50">
              {loading ? t('orders.returnSubmitting') : t('orders.returnSubmit')}
            </button>
            <button type="button" onClick={onClose}
              className="btn-secondary text-sm">{t('orders.cancel')}</button>
          </div>
        </form>
      )}
    </div>
  )
}

function OrderCard({ order, returningId, setReturningId, onCancelled }) {
  const { t } = useLocale()
  const egp = (amount) => t('currency.egp', { amount: Number(amount).toFixed(0) })
  const [submittedReturnId, setSubmittedReturnId] = useState(null)
  const [cancelling, setCancelling] = useState(false)
  const STATUS_LABEL = {
    pending:   t('order.statusPending'),
    confirmed: t('order.statusConfirmed'),
    shipped:   t('order.statusShipped'),
    delivered: t('order.statusDelivered'),
    cancelled: t('order.statusCancelled'),
  }

  function handleCancel() {
    setSubmittedReturnId(null)
    setReturningId(null)
  }

  return (
    <div className="surface-card p-5 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-mono text-xs text-[var(--muted)] mb-1">{order.id}</p>
          <p className="text-xs text-[var(--muted)]">
            {new Date(order.created_at).toLocaleDateString('en-EG', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <div className="flex flex-col items-end gap-2 shrink-0">
          <span className={`text-xs font-semibold border rounded-full px-2.5 py-0.5 ${STATUS_STYLE[order.status] || STATUS_STYLE.pending}`}>
            {STATUS_LABEL[order.status] || order.status}
          </span>
          <span className="font-semibold text-sm text-[var(--text)]">{egp(order.total)}</span>
        </div>
      </div>

      <ul className="text-xs text-[var(--muted)] space-y-1 border-t border-[var(--border)] pt-3">
        {order.items?.slice(0, 3).map((item, i) => (
          <li key={i} className="flex justify-between">
            <span>{item.quantity} × {item.name}</span>
            <span>{egp(item.price * item.quantity)}</span>
          </li>
        ))}
        {order.items?.length > 3 && (
          <li className="text-[var(--muted)]/50">+{order.items.length - 3} more</li>
        )}
      </ul>

      <div className="flex flex-wrap gap-2 pt-1">
        <Link to={`/order/${order.id}`}
          className="text-xs font-semibold text-[var(--brand)] border border-[var(--brand)]/30 rounded-full px-4 py-1.5 hover:bg-[var(--brand-dim)] transition-colors">
          {t('orders.track')}
        </Link>
        {order.status === 'pending' && (
          <>
            <Link to={`/order/${order.id}/edit`}
              className="text-xs font-medium text-[var(--brand)] border border-[var(--brand)]/30 rounded-full px-4 py-1.5 hover:bg-[var(--brand-dim)] transition-colors">
              {t('edit.order')}
            </Link>
            <button onClick={async () => {
              if (!window.confirm(t('orders.cancelConfirm'))) return
              setCancelling(true)
              try {
                await cancelOrder(order.id)
                if (onCancelled) onCancelled()
              } catch (err) {
                alert(err.message || t('orders.cancelError'))
              } finally {
                setCancelling(false)
              }
            }} disabled={cancelling}
              className="text-xs font-medium text-red-500 border border-red-200 rounded-full px-4 py-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50">
              {cancelling ? t('orders.cancelling') : t('orders.cancelOrder')}
            </button>
          </>
        )}
        {order.status === 'delivered' && (
          <button onClick={returningId === order.id ? handleCancel : () => setReturningId(order.id)}
            className={`text-xs font-medium border rounded-full px-4 py-1.5 transition-colors ${
              returningId === order.id
                ? 'border-[var(--brand)] text-[var(--brand)] bg-[var(--brand-dim)]'
                : 'border-[var(--border)] text-[var(--muted)] hover:border-[var(--brand)]/30'
            }`}>
            {returningId === order.id ? t('orders.cancel') : t('orders.requestReturn')}
          </button>
        )}
      </div>

      {returningId === order.id && (
        <ReturnForm orderId={order.id} onSuccess={setSubmittedReturnId} onClose={() => setReturningId(null)} />
      )}
    </div>
  )
}

const isOrderId = q => /^order-\d+$/i.test(q.trim())

export default function MyOrders() {
  const { t } = useLocale()
  const [query, setQuery]         = useState('')
  const [orders, setOrders]       = useState([])
  const [status, setStatus]       = useState('idle')
  const [error, setError]         = useState('')
  const [returningId, setReturningId] = useState(null)

  async function handleLookup(e) {
    e.preventDefault()
    const q = query.trim()
    if (!q) return
    setStatus('loading')
    setError('')
    setReturningId(null)
    try {
      if (isOrderId(q)) {
        const order = await fetchOrder(q.toLowerCase())
        setOrders(order ? [order] : [])
      } else {
        const data = await fetchOrdersByPhone(q)
        setOrders(data)
      }
      setStatus('done')
    } catch {
      setOrders([])
      setStatus('done')
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-5 sm:px-8 py-14 sm:py-20">
      <motion.div className="text-center mb-10" {...fadeUp}>
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--brand-dim)] border border-[var(--brand)]/10 mb-4">
          <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--brand)]">{t('orders.badge')}</span>
        </div>
        <h1 className="text-display text-[var(--text)] mb-2">{t('orders.title')}</h1>
        <p className="text-sm text-[var(--muted)]">
          {t('orders.desc')}
        </p>
      </motion.div>

      <motion.div className="surface-card p-5 sm:p-6 mb-8"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 0.55, ease: [0.25, 0.1, 0.25, 1], delay: 0.1 }}
      >
        <form onSubmit={handleLookup} className="space-y-3">
          <div className="flex gap-3">
            <input type="text" value={query} onChange={e => setQuery(e.target.value)} data-search-input
              placeholder={t('orders.placeholder')}
              required
              className="flex-1 rounded-full border border-[var(--border)] px-5 py-3 text-sm bg-[var(--surface)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--brand)]" />
            <button type="submit" disabled={status === 'loading'}
              className="btn-primary text-sm disabled:opacity-50 whitespace-nowrap">
              {status === 'loading' ? t('orders.searching') : t('orders.search')}
            </button>
          </div>
          <p className="text-xs text-[var(--muted)] text-center">
            {isOrderId(query) ? t('orders.searchById') : t('orders.searchDesc')}
          </p>
        </form>
      </motion.div>

      {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-6">{error}</p>}

      {status === 'done' && (
        orders.length === 0 ? (
          <div className="text-center py-12 space-y-4">
            <p className="text-sm text-[var(--muted)]">{t('orders.noOrders')}</p>
            <Link to="/shop" className="btn-primary text-sm">{t('orders.browseShop')}</Link>
          </div>
        ) : (
          <motion.div className="space-y-4"
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.05 }}
          >
            <p className="text-xs text-[var(--muted)]">{t('orders.found', { count: orders.length, s: orders.length !== 1 ? 's' : '' })}</p>
            {orders.map(order => (
              <motion.div key={order.id} variants={staggerItem}>
                <OrderCard order={order} returningId={returningId} setReturningId={setReturningId}
                  onCancelled={async () => {
                    const q = document.querySelector('[data-search-input]')?.value || query
                    if (isOrderId(q)) {
                      const o = await fetchOrder(q.toLowerCase())
                      setOrders(o ? [o] : [])
                    } else {
                      setOrders(await fetchOrdersByPhone(q))
                    }
                  }} />
              </motion.div>
            ))}
          </motion.div>
        )
      )}

      {status === 'idle' && (
        <motion.div className="grid sm:grid-cols-3 gap-4 mt-4"
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
        >
          {[
            { icon: '📦', title: t('orders.trackTitle'), desc: t('orders.trackDesc') },
            { icon: '🕐', title: t('orders.historyTitle'), desc: t('orders.historyDesc') },
            { icon: '↩️', title: t('orders.returnTitle'), desc: t('orders.returnDesc') },
          ].map(tip => (
            <motion.div key={tip.title} variants={staggerItem} className="surface-card p-5 text-center">
              <span className="text-2xl block mb-3">{tip.icon}</span>
              <p className="text-xs font-semibold text-[var(--text)] mb-1">{tip.title}</p>
              <p className="text-[11px] text-[var(--muted)]">{tip.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  )
}