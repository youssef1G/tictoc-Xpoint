import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext.jsx'
import { useLocale } from '../../context/LocaleContext.jsx'
import { fetchAnalytics } from '../../api.js'
import { LoadingState } from '../../components/StatusStates.jsx'
import CustomSelect from '../../components/CustomSelect.jsx'

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
  const { t } = useLocale()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [days, setDays] = useState(30)
  const dayOptions = [
    { value: 7, label: t('admin.analytics.last7') },
    { value: 30, label: t('admin.analytics.last30') },
    { value: 90, label: t('admin.analytics.last90') },
    { value: 365, label: t('admin.analytics.lastYear') },
  ]

  useEffect(() => {
    setLoading(true)
    fetchAnalytics(token, days)
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [days])

  if (loading) return <LoadingState label={t('admin.analytics.loading')} />

  if (!data) return (
    <div className="text-center py-16">
      <p className="text-sm text-[var(--muted)]">{t('admin.analytics.noData')}</p>
    </div>
  )

  const maxCategory = Math.max(1, ...(data.ordersByCategory || []).map(c => c.count))

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="font-heading text-xl font-bold text-[var(--text)]">{t('admin.analytics.title')}</h2>
          <p className="text-xs text-[var(--muted)] mt-1">{t('admin.analytics.subtitle')}</p>
        </div>
        <div className="w-full sm:w-[180px]">
          <CustomSelect value={days} onChange={v => setDays(v)} options={dayOptions} placeholder={t('admin.analytics.last30')} />
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label={t('admin.analytics.totalOrders')} value={data.totalOrders || 0} />
        <StatCard label={t('admin.analytics.revenue')} value={`EGP ${Number(data.totalRevenue || 0).toFixed(0)}`} accent="text-[var(--brand)]" />
        <StatCard label={t('admin.analytics.avgOrder')} value={`EGP ${Number(data.avgOrderValue || 0).toFixed(0)}`} />
        <StatCard label={t('admin.analytics.completionRate')} value={data.completionRate != null ? `${data.completionRate}%` : '—'} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="surface-card p-5">
          <h3 className="font-heading text-sm font-bold text-[var(--text)] mb-4">{t('admin.analytics.ordersByStatus')}</h3>
          <div className="space-y-2">
            {(data.ordersByStatus || []).map(s => (
              <ChartBar key={s.status} label={s.status} value={s.count} max={data.totalOrders} />
            ))}
            {(!data.ordersByStatus || data.ordersByStatus.length === 0) && (
              <p className="text-xs text-[var(--muted)]">{t('admin.analytics.noOrders')}</p>
            )}
          </div>
        </div>

        <div className="surface-card p-5">
          <h3 className="font-heading text-sm font-bold text-[var(--text)] mb-4">{t('admin.analytics.ordersByCategory')}</h3>
          <div className="space-y-2">
            {(data.ordersByCategory || []).map(c => (
              <ChartBar key={c.category} label={c.category} value={c.count} max={maxCategory} color="var(--accent)" />
            ))}
            {(!data.ordersByCategory || data.ordersByCategory.length === 0) && (
              <p className="text-xs text-[var(--muted)]">{t('admin.analytics.noCatData')}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
