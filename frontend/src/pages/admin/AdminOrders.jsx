import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { fetchOrders, updateOrder } from '../../api.js'
import CustomSelect from '../../components/CustomSelect.jsx'

const STATUS_OPTIONS = [
  { value: 'pending',   label: '🕐 Pending'   },
  { value: 'confirmed', label: '✅ Confirmed'  },
  { value: 'shipped',   label: '🚚 Shipped'    },
  { value: 'delivered', label: '📦 Delivered'  },
  { value: 'cancelled', label: '❌ Cancelled'  },
]

const STATUS_BADGE = {
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

const FILTER_OPTIONS = [
  { value: 'all',       label: 'All orders'   },
  { value: 'pending',   label: '🕐 Pending'   },
  { value: 'confirmed', label: '✅ Confirmed'  },
  { value: 'shipped',   label: '🚚 Shipped'    },
  { value: 'delivered', label: '📦 Delivered'  },
  { value: 'cancelled', label: '❌ Cancelled'  },
]

function formatDate(str) {
  if (!str) return '—'
  return new Date(str).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function AdminOrders() {
  const { token } = useAuth()
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState({})
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    fetchOrders(token)
      .then(setOrders)
      .catch(err => { if (err.status === 401) navigate('/admin-access') })
      .finally(() => setLoading(false))
  }, [])

  async function handleUpdate(id, fields) {
    setSaving(s => ({ ...s, [id]: true }))
    try {
      const updated = await updateOrder(token, id, fields)
      setOrders(prev => prev.map(o => o.id === id ? { ...o, ...updated } : o))
    } catch (err) {
      if (err.status === 401) navigate('/admin-access')
    } finally {
      setSaving(s => ({ ...s, [id]: false }))
    }
  }

  const filtered = orders.filter(o => {
    const matchesFilter = filter === 'all' || o.status === filter
    const q = search.toLowerCase()
    const matchesSearch = !q ||
      o.id.toLowerCase().includes(q) ||
      o.customer?.name?.toLowerCase().includes(q) ||
      o.customer?.phone?.includes(q)
    return matchesFilter && matchesSearch
  })

  const counts = orders.reduce((acc, o) => { acc[o.status] = (acc[o.status] || 0) + 1; return acc }, {})

  if (loading) return <p className="text-sm text-[var(--muted)] py-10 text-center">Loading...</p>
  if (!orders.length) return <p className="text-sm text-[var(--muted)] py-10 text-center">No orders yet.</p>

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2">
        <button onClick={() => setFilter('all')}
          className={`text-xs font-semibold border rounded-full px-3 py-1 transition-colors ${
            filter === 'all' ? 'bg-[var(--brand)] text-white border-[var(--brand)]' : 'text-[var(--muted)] border-[var(--border)] hover:border-[var(--brand)]'
          }`}>
          All · {orders.length}
        </button>
        {Object.entries(counts).map(([status, count]) => (
          <button key={status} onClick={() => setFilter(filter === status ? 'all' : status)}
            className={`text-xs font-semibold border rounded-full px-3 py-1 transition-colors ${
              filter === status
                ? 'bg-[var(--brand)] text-white border-[var(--brand)]'
                : STATUS_BADGE[status] || 'text-[var(--muted)] border-[var(--border)]'
            }`}>
            {STATUS_LABEL[status] || status} · {count}
          </button>
        ))}
      </div>

      <input type="text" value={search} onChange={e => setSearch(e.target.value)}
        placeholder="Search by order ID, name or phone..."
        className="w-full rounded-full border border-[var(--border)] px-5 py-2.5 text-sm bg-[var(--surface)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--brand)]" />

      <p className="text-xs text-[var(--muted)]">
        Showing {filtered.length} of {orders.length} order{orders.length !== 1 ? 's' : ''}
      </p>

      {filtered.length === 0 ? (
        <p className="text-sm text-[var(--muted)] text-center py-10">No orders match your search.</p>
      ) : (
        filtered.map(order => (
          <div key={order.id} className="surface-card">
            <div className="flex flex-wrap items-center justify-between gap-2 px-5 py-3 bg-[var(--muted)]/5 border-b border-[var(--border)] rounded-t-2xl">
              <div className="flex items-center gap-2.5">
                <span className="font-mono text-[11px] text-[var(--muted)]">{order.id}</span>
                <span className={`text-[11px] font-semibold border rounded-full px-2.5 py-0.5 ${STATUS_BADGE[order.status] || 'text-[var(--muted)] border-[var(--border)]'}`}>
                  {STATUS_LABEL[order.status] || order.status}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-semibold text-sm text-[var(--text)]">EGP {Number(order.total || 0).toFixed(0)}</span>
                <span className="text-[11px] text-[var(--muted)]">{formatDate(order.created_at)}</span>
              </div>
            </div>

            <div className="p-5 space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--muted)] mb-2">Customer</p>
                  <p className="text-sm font-semibold text-[var(--text)]">{order.customer?.name}</p>
                  <p className="text-xs text-[var(--muted)]">{order.customer?.phone}</p>
                  {order.customer?.email && <p className="text-xs text-[var(--muted)]">{order.customer.email}</p>}
                  <p className="text-xs text-[var(--muted)]">{order.customer?.address}, {order.customer?.city}</p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--muted)] mb-2">Items</p>
                  <ul className="space-y-1">
                    {(order.items || []).map((item, i) => (
                      <li key={i} className="flex justify-between text-xs text-[var(--muted)]">
                        <span>{item.name} × {item.quantity}</span>
                        <span>EGP {Number((item.price || 0) * (item.quantity || 0)).toFixed(0)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 pt-4 border-t border-[var(--border)] items-end">
                <div className="flex-1 min-w-[160px]">
                  <label className="block text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--muted)] mb-1.5">Status</label>
                  <CustomSelect value={order.status} onChange={val => handleUpdate(order.id, { status: val })} options={STATUS_OPTIONS} />
                </div>

                <div className="flex-1 min-w-[180px]">
                  <label className="block text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--muted)] mb-1.5">Est. delivery</label>
                  <input type="date" defaultValue={order.estimated_delivery || ''}
                    min={new Date().toISOString().split('T')[0]}
                    onKeyDown={e => { if (e.key === 'Enter') e.target.blur() }}
                    onBlur={e => {
                      const value = e.target.value || null
                      if (value !== (order.estimated_delivery || null))
                        handleUpdate(order.id, { estimated_delivery: value })
                    }}
                    className="w-full rounded-xl border border-[var(--border)] px-3 py-2 text-xs bg-[var(--surface)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--brand)]" />
                  {order.estimated_delivery && (
                    <p className="text-[11px] text-[var(--brand)] mt-1">{formatDate(order.estimated_delivery)}</p>
                  )}
                </div>

                {saving[order.id] && <p className="text-xs text-[var(--muted)] animate-pulse">Saving...</p>}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  )
}