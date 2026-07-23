import { useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchOrdersByPhone, fetchOrder, submitReturn } from '../api.js'
import CustomSelect from '../components/CustomSelect.jsx'

const STATUS_STYLE = {
  pending:   'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800',
  confirmed: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800',
  shipped:   'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800',
  delivered: 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800',
  cancelled: 'bg-gray-50 text-gray-500 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700',
}

const STATUS_LABEL = {
  pending:   'Pending',
  confirmed: 'Confirmed',
  shipped:   'Out for delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
}

const RETURN_REASONS = [
  { value: 'Item damaged or defective', label: 'Damaged or defective' },
  { value: 'Wrong item received',       label: 'Wrong item received' },
  { value: 'Item not as described',     label: 'Not as described' },
  { value: 'Changed my mind',           label: 'Changed my mind' },
  { value: 'Other',                     label: 'Other' },
]

function ReturnForm({ orderId, onClose }) {
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
      await submitReturn({ order_id: orderId, reason, details })
      setSuccess(true)
    } catch (err) {
      setError(err.message || 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  if (success) return (
    <div className="mt-4 surface-card p-5 text-center">
      <p className="text-2xl mb-2">{'✅'}</p>
      <p className="text-sm font-semibold text-green-700 dark:text-green-400">Return request submitted!</p>
      <p className="text-xs text-green-600 dark:text-green-500 mt-1">We'll review it and get back to you shortly.</p>
    </div>
  )

  return (
    <div className="mt-4 surface-card p-5 space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-heading font-semibold text-[var(--text)]">Request a return</p>
        <div className="flex gap-1.5">
          {[1, 2].map(s => (
            <div key={s} className={`h-1.5 w-5 rounded-full transition-colors ${s <= step ? 'bg-[var(--brand)]' : 'bg-[var(--border)]'}`} />
          ))}
        </div>
      </div>

      {step === 1 && (
        <div className="space-y-3">
          <p className="text-xs text-[var(--muted)]">Why are you returning this order?</p>
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
            Continue →
          </button>
        </div>
      )}

      {step === 2 && (
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex items-center gap-2 bg-[var(--brand-dim)] border border-[var(--brand)]/10 rounded-xl px-3 py-2">
            <span className="text-xs text-[var(--brand)] font-medium">{RETURN_REASONS.find(r => r.value === reason)?.label}</span>
            <button type="button" onClick={() => setStep(1)} className="ml-auto text-xs text-[var(--muted)] hover:text-[var(--brand)] transition-colors">Change</button>
          </div>
          <div>
            <label className="block text-xs text-[var(--muted)] mb-1.5">
              Additional details <span className="text-[var(--muted)]/50">(optional)</span>
            </label>
            <textarea value={details} onChange={e => setDetails(e.target.value)} rows={3}
              placeholder="Describe the issue in more detail..."
              className="w-full rounded-xl border border-[var(--border)] px-4 py-3 text-sm bg-[var(--surface)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--brand)] resize-none" />
          </div>
          {error && <p className="text-xs text-red-500">{error}</p>}
          <div className="flex gap-2">
            <button type="submit" disabled={loading}
              className="btn-primary flex-1 text-sm disabled:opacity-50">
              {loading ? 'Submitting...' : 'Submit return'}
            </button>
            <button type="button" onClick={onClose}
              className="btn-secondary text-sm">Cancel</button>
          </div>
        </form>
      )}
    </div>
  )
}

function OrderCard({ order, returningId, setReturningId }) {
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
          <span className="font-semibold text-sm text-[var(--text)]">EGP {Number(order.total).toFixed(0)}</span>
        </div>
      </div>

      <ul className="text-xs text-[var(--muted)] space-y-1 border-t border-[var(--border)] pt-3">
        {order.items?.slice(0, 3).map((item, i) => (
          <li key={i} className="flex justify-between">
            <span>{item.quantity} × {item.name}</span>
            <span>EGP {Number(item.price * item.quantity).toFixed(0)}</span>
          </li>
        ))}
        {order.items?.length > 3 && (
          <li className="text-[var(--muted)]/50">+{order.items.length - 3} more</li>
        )}
      </ul>

      <div className="flex flex-wrap gap-2 pt-1">
        <Link to={`/order/${order.id}`}
          className="text-xs font-semibold text-[var(--brand)] border border-[var(--brand)]/30 rounded-full px-4 py-1.5 hover:bg-[var(--brand-dim)] transition-colors">
          Track order →
        </Link>
        {order.status === 'delivered' && (
          <button onClick={() => setReturningId(returningId === order.id ? null : order.id)}
            className={`text-xs font-medium border rounded-full px-4 py-1.5 transition-colors ${
              returningId === order.id
                ? 'border-[var(--brand)] text-[var(--brand)] bg-[var(--brand-dim)]'
                : 'border-[var(--border)] text-[var(--muted)] hover:border-[var(--brand)]/30'
            }`}>
            {returningId === order.id ? 'Cancel' : 'Request return'}
          </button>
        )}
      </div>

      {returningId === order.id && (
        <ReturnForm orderId={order.id} onClose={() => setReturningId(null)} />
      )}
    </div>
  )
}

const isOrderId = q => /^order-\d+$/i.test(q.trim())

export default function MyOrders() {
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
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--brand-dim)] border border-[var(--brand)]/10 mb-4">
          <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--brand)]">Orders</span>
        </div>
        <h1 className="text-display text-[var(--text)] mb-2">My orders</h1>
        <p className="text-sm text-[var(--muted)]">
          Track your orders, view history, or request a return.
        </p>
      </div>

      <div className="surface-card p-5 sm:p-6 mb-8">
        <form onSubmit={handleLookup} className="space-y-3">
          <div className="flex gap-3">
            <input type="text" value={query} onChange={e => setQuery(e.target.value)}
              placeholder="Phone number or order ID"
              required
              className="flex-1 rounded-full border border-[var(--border)] px-5 py-3 text-sm bg-[var(--surface)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--brand)]" />
            <button type="submit" disabled={status === 'loading'}
              className="btn-primary text-sm disabled:opacity-50 whitespace-nowrap">
              {status === 'loading' ? 'Searching...' : 'Search'}
            </button>
          </div>
          <p className="text-xs text-[var(--muted)] text-center">
            {isOrderId(query) ? 'Searching by order ID' : 'Enter your Egyptian mobile number to see all orders'}
          </p>
        </form>
      </div>

      {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-6">{error}</p>}

      {status === 'done' && (
        orders.length === 0 ? (
          <div className="text-center py-12 space-y-4">
            <p className="text-sm text-[var(--muted)]">No orders found. Try a different phone number or order ID.</p>
            <Link to="/shop" className="btn-primary text-sm">Browse the shop</Link>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-xs text-[var(--muted)]">{orders.length} order{orders.length !== 1 ? 's' : ''} found</p>
            {orders.map(order => (
              <OrderCard key={order.id} order={order} returningId={returningId} setReturningId={setReturningId} />
            ))}
          </div>
        )
      )}

      {status === 'idle' && (
        <div className="grid sm:grid-cols-3 gap-4 mt-4">
          {[
            { icon: '📦', title: 'Track your order', desc: 'See real-time delivery status' },
            { icon: '🕐', title: 'Order history', desc: 'Look up past orders by phone number' },
            { icon: '↩️', title: 'Request a return', desc: 'Initiate a return on delivered orders' },
          ].map(tip => (
            <div key={tip.title} className="surface-card p-5 text-center">
              <span className="text-2xl block mb-3">{tip.icon}</span>
              <p className="text-xs font-semibold text-[var(--text)] mb-1">{tip.title}</p>
              <p className="text-[11px] text-[var(--muted)]">{tip.desc}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}