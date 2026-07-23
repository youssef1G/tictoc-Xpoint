import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext.jsx'
import { fetchDashboard, fetchOrders, fetchProducts } from '../../api.js'
import { Link } from 'react-router-dom'

function StatCard({ label, value, icon, accent }) {
  return (
    <div className="surface-card p-5 flex items-center gap-4">
      <div className="w-10 h-10 rounded-xl bg-[var(--brand-dim)] flex items-center justify-center text-lg shrink-0">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--muted)] truncate">{label}</p>
        <p className={`font-heading text-xl font-bold ${accent || 'text-[var(--text)]'}`}>{value}</p>
      </div>
    </div>
  )
}

function RecentOrderRow({ order }) {
  const statusBadge = {
    pending: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800',
    confirmed: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800',
    shipped: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800',
    delivered: 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800',
    cancelled: 'bg-gray-50 text-gray-500 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700',
  }
  return (
    <tr className="border-t border-[var(--border)] hover:bg-[var(--muted)]/5 transition-colors">
      <td className="px-4 py-3 font-mono text-xs text-[var(--muted)]">{order.id}</td>
      <td className="px-4 py-3 text-sm text-[var(--text)]">{order.customer?.name || order.phone || '—'}</td>
      <td className="px-4 py-3 text-xs text-[var(--muted)]">EGP {Number(order.total || 0).toFixed(0)}</td>
      <td className="px-4 py-3">
        <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-semibold border ${statusBadge[order.status] || ''}`}>
          {order.status}
        </span>
      </td>
    </tr>
  )
}

export default function AdminDashboard() {
  const { token } = useAuth()
  const [stats, setStats] = useState(null)
  const [recentOrders, setRecentOrders] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetchDashboard(token),
      fetchOrders(token),
      fetchProducts(),
    ]).then(([d, orders, prods]) => {
      setStats(d)
      setRecentOrders(orders.slice(0, 5))
      setProducts(prods)
    }).catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="surface-card h-24 animate-pulse" />
        ))}
      </div>
      <div className="surface-card h-64 animate-pulse" />
    </div>
  )

  if (!stats) return null

  const lowStockProducts = products.filter(p => p.stock != null && p.stock <= 10)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-xl font-bold text-[var(--text)]">Dashboard</h2>
        <p className="text-xs text-[var(--muted)] mt-1">Overview of your store</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Revenue" value={`EGP ${Number(stats.deliveredRevenue || 0).toFixed(0)}`} icon="💰" accent="text-[var(--brand)]" />
        <StatCard label="Total Orders" value={stats.totalOrders || 0} icon="📦" />
        <StatCard label="Pending" value={stats.pendingOrders || 0} icon="🕐"
          accent={stats.pendingOrders > 0 ? 'text-amber-500' : 'text-[var(--text)]'} />
        <StatCard label="Products" value={stats.totalProducts || 0} icon="💍" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="surface-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading text-sm font-bold text-[var(--text)]">Recent Orders</h3>
            <Link to="/admin/orders" className="text-xs font-medium text-[var(--brand)] hover:underline">
              View all →
            </Link>
          </div>
          {recentOrders.length === 0 ? (
            <p className="text-sm text-[var(--muted)] py-6 text-center">No orders yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left">
                    <th className="px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--muted)]">ID</th>
                    <th className="px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--muted)]">Customer</th>
                    <th className="px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--muted)]">Total</th>
                    <th className="px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--muted)]">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map(o => <RecentOrderRow key={o.id} order={o} />)}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="surface-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading text-sm font-bold text-[var(--text)]">Low Stock Alerts</h3>
            <Link to="/admin/products" className="text-xs font-medium text-[var(--brand)] hover:underline">
              Manage stock →
            </Link>
          </div>
          {lowStockProducts.length === 0 ? (
            <p className="text-sm text-[var(--muted)] py-6 text-center">All products are well-stocked.</p>
          ) : (
            <div className="space-y-2">
              {lowStockProducts.slice(0, 5).map(p => (
                <div key={p.id} className="flex items-center justify-between py-2 px-3 rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800">
                  <div className="flex items-center gap-3 min-w-0">
                    <img src={p.images?.[0] || p.image} alt={p.name} className="h-8 w-8 rounded-lg object-cover bg-[var(--muted)]/5 shrink-0" />
                    <span className="text-xs font-medium text-[var(--text)] truncate">{p.name}</span>
                  </div>
                  <span className="text-[11px] font-semibold text-amber-700 dark:text-amber-400 shrink-0 ml-3">
                    {p.stock === 0 ? 'Out of stock' : `${p.stock} left`}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
