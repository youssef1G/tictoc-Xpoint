import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext.jsx'
import { fetchAnalytics } from '../../api.js'
import { LoadingState } from '../../components/StatusStates.jsx'

function StatCard({ label, value, subtitle, accent }) {
  return (
    <div className="surface-card p-5">
      <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--muted)] mb-1">{label}</p>
      <p className={`font-heading text-2xl font-bold ${accent || 'text-[var(--text)]'}`}>{value}</p>
      {subtitle && <p className="text-xs text-[var(--muted)] mt-1">{subtitle}</p>}
    </div>
  )
}

function ChartBar({ label, value, max, color }) {
  const pct = max > 0 ? (value / max) * 100 : 0
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-[var(--muted)] w-20 shrink-0 truncate">{label}</span>
      <div className="flex-1 h-6 rounded-lg bg-[var(--muted)]/10 overflow-hidden">
        <div className="h-full rounded-lg transition-all duration-500" style={{ width: `${pct}%`, background: color || 'var(--brand)' }} />
      </div>
      <span className="text-xs font-semibold text-[var(--text)] w-10 text-right">{value}</span>
    </div>
  )
}

export default function AdminAnalytics() {
  const { token } = useAuth()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [days, setDays] = useState(30)

  useEffect(() => {
    setLoading(true)
    fetchAnalytics(token, days)
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [days])

  if (loading) return <LoadingState label="Loading analytics..." />

  if (!data) return (
    <div className="text-center py-16">
      <p className="text-sm text-[var(--muted)]">No analytics data available yet.</p>
    </div>
  )

  const maxCategory = Math.max(1, ...(data.ordersByCategory || []).map(c => c.count))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading text-xl font-bold text-[var(--text)]">Analytics</h2>
          <p className="text-xs text-[var(--muted)] mt-1">Sales and performance data</p>
        </div>
        <select value={days} onChange={e => setDays(Number(e.target.value))}
          className="text-xs bg-[var(--surface)] border border-[var(--border)] rounded-xl px-3 py-2 text-[var(--text)] focus:outline-none focus:border-[var(--brand)]">
          <option value={7}>Last 7 days</option>
          <option value={30}>Last 30 days</option>
          <option value={90}>Last 90 days</option>
          <option value={365}>Last year</option>
        </select>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Orders" value={data.totalOrders || 0} />
        <StatCard label="Revenue" value={`EGP ${Number(data.totalRevenue || 0).toFixed(0)}`} accent="text-[var(--brand)]" />
        <StatCard label="Avg Order Value" value={`EGP ${Number(data.avgOrderValue || 0).toFixed(0)}`} />
        <StatCard label="Completion Rate" value={data.completionRate != null ? `${data.completionRate}%` : '—'} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="surface-card p-5">
          <h3 className="font-heading text-sm font-bold text-[var(--text)] mb-4">Orders by Status</h3>
          <div className="space-y-2">
            {(data.ordersByStatus || []).map(s => (
              <ChartBar key={s.status} label={s.status} value={s.count} max={data.totalOrders} />
            ))}
            {(!data.ordersByStatus || data.ordersByStatus.length === 0) && (
              <p className="text-xs text-[var(--muted)]">No orders yet.</p>
            )}
          </div>
        </div>

        <div className="surface-card p-5">
          <h3 className="font-heading text-sm font-bold text-[var(--text)] mb-4">Orders by Category</h3>
          <div className="space-y-2">
            {(data.ordersByCategory || []).map(c => (
              <ChartBar key={c.category} label={c.category} value={c.count} max={maxCategory} color="var(--accent)" />
            ))}
            {(!data.ordersByCategory || data.ordersByCategory.length === 0) && (
              <p className="text-xs text-[var(--muted)]">No category data yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
