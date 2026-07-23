import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext.jsx'
import { fetchDashboard } from '../../api.js'

function StatCard({ label, value, icon, accent }) {
  return (
    <div className="surface-card p-4 flex items-center gap-3">
      <span className="text-xl shrink-0">{icon}</span>
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--muted)] truncate">{label}</p>
        <p className={`font-heading text-lg font-bold ${accent || 'text-[var(--text)]'}`}>{value}</p>
      </div>
    </div>
  )
}

export default function DashboardSummary() {
  const { token } = useAuth()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboard(token)
      .then(setStats)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="surface-card h-20 animate-pulse" />
      ))}
    </div>
  )

  if (!stats) return null

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
      <StatCard label="Total products" value={stats.totalProducts} icon="💍" />
      <StatCard label="Out of stock" value={stats.outOfStock} icon="🚫"
        accent={stats.outOfStock > 0 ? 'text-red-500' : 'text-[var(--text)]'} />
      <StatCard label="Low stock" value={stats.lowStock} icon="⚠️"
        accent={stats.lowStock > 0 ? 'text-amber-500' : 'text-[var(--text)]'} />
      <StatCard label="Total orders" value={stats.totalOrders} icon="📦" />
      <StatCard label="Pending orders" value={stats.pendingOrders} icon="🕐"
        accent={stats.pendingOrders > 0 ? 'text-amber-500' : 'text-[var(--text)]'} />
      <StatCard label="Revenue" value={`EGP ${Number(stats.deliveredRevenue).toFixed(0)}`} icon="💰" accent="text-[var(--brand)]" />
    </div>
  )
}