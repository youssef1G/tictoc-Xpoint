import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext.jsx'
import { useLocale } from '../../context/LocaleContext.jsx'
import { fetchAnalytics } from '../../api.js'
import { LoadingState } from '../../components/StatusStates.jsx'
import CustomSelect from '../../components/CustomSelect.jsx'
import { ShoppingBag, DollarSign, TrendingUp, Percent, Sparkles } from 'lucide-react'

const STATUS_COLORS = {
  pending:   { bar: '#F59E0B', bg: 'bg-amber-50 dark:bg-amber-900/10', text: 'text-amber-700 dark:text-amber-400' },
  confirmed: { bar: '#3B82F6', bg: 'bg-blue-50 dark:bg-blue-900/10',  text: 'text-blue-700 dark:text-blue-400' },
  shipped:   { bar: '#8B5CF6', bg: 'bg-purple-50 dark:bg-purple-900/10', text: 'text-purple-700 dark:text-purple-400' },
  delivered: { bar: '#10B981', bg: 'bg-green-50 dark:bg-green-900/10', text: 'text-green-700 dark:text-green-400' },
  cancelled: { bar: '#9CA3AF', bg: 'bg-gray-50 dark:bg-gray-800',       text: 'text-gray-500 dark:text-gray-400' },
}

function StatCard({ label, value, icon, accent }) {
  return (
    <div className="surface-card p-5 flex items-center gap-4 group hover:-translate-y-0.5 transition-all duration-200">
      <div className="w-10 h-10 rounded-xl bg-[var(--brand-dim)] flex items-center justify-center text-lg shrink-0 group-hover:scale-105 transition-transform duration-200">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--muted)] truncate">{label}</p>
        <p className={`font-heading text-xl font-bold ${accent || 'text-[var(--text)]'} mt-0.5`}>{value}</p>
      </div>
    </div>
  )
}

function ChartBar({ label, value, max, color, bgClass, labelClass }) {
  const pct = max > 0 ? (value / max) * 100 : 0
  return (
    <div className="flex items-center gap-3 group">
      <span className={`text-xs w-24 shrink-0 truncate font-medium ${labelClass || 'text-[var(--muted)]'}`}>{label}</span>
      <div className={`flex-1 h-7 rounded-lg overflow-hidden ${bgClass || 'bg-[var(--muted)]/10'}`}>
        <div
          className="h-full rounded-lg transition-all duration-700 ease-out"
          style={{ width: `${pct}%`, background: color || 'var(--brand)' }}
        />
      </div>
      <span className={`text-xs font-semibold w-10 text-right tabular-nums ${labelClass || 'text-[var(--text)]'}`}>{value}</span>
    </div>
  )
}

export default function AdminAnalytics() {
  const { token } = useAuth()
  const { t } = useLocale()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [days, setDays] = useState(30)
  const egp = (amount) => t('currency.egp', { amount: Number(amount).toFixed(0) })
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

  const statusMap = {
    pending:   t('order.statusPending'),
    confirmed: t('order.statusConfirmed'),
    shipped:   t('order.statusShipped'),
    delivered: t('order.statusDelivered'),
    cancelled: t('order.statusCancelled'),
  }

  if (loading) return <LoadingState label={t('admin.analytics.loading')} />

  if (!data) return (
    <div className="flex flex-col items-center justify-center py-24 gap-4">
      <div className="w-14 h-14 rounded-2xl bg-[var(--brand-dim)] flex items-center justify-center">
        <Sparkles size={24} className="text-[var(--brand)]" />
      </div>
      <p className="text-sm text-[var(--muted)]">{t('admin.analytics.noData')}</p>
    </div>
  )

  const maxCategory = Math.max(1, ...(data.ordersByCategory || []).map(c => c.count))

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-lg bg-[var(--brand-dim)] flex items-center justify-center">
              <Sparkles size={16} className="text-[var(--brand)]" />
            </div>
            <div>
              <h2 className="font-heading text-xl font-bold text-[var(--text)]">{t('admin.analytics.title')}</h2>
              <p className="text-xs text-[var(--muted)]">{t('admin.analytics.subtitle')}</p>
            </div>
          </div>
        </div>
        <div className="w-full sm:w-[180px]">
          <CustomSelect value={days} onChange={v => setDays(v)} options={dayOptions} placeholder={t('admin.analytics.last30')} />
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label={t('admin.analytics.totalOrders')} value={data.totalOrders || 0}
          icon={<ShoppingBag size={18} className="text-[var(--brand)]" />} />
        <StatCard label={t('admin.analytics.revenue')} value={egp(data.totalRevenue || 0)} accent="text-[var(--brand)]"
          icon={<DollarSign size={18} className="text-[var(--brand)]" />} />
        <StatCard label={t('admin.analytics.avgOrder')} value={egp(data.avgOrderValue || 0)}
          icon={<TrendingUp size={18} className="text-[var(--brand)]" />} />
        <StatCard label={t('admin.analytics.completionRate')} value={data.completionRate != null ? `${data.completionRate}%` : '—'}
          icon={<Percent size={18} className="text-[var(--brand)]" />}
          accent={data.completionRate >= 80 ? 'text-green-600 dark:text-green-400' : data.completionRate >= 50 ? 'text-amber-600 dark:text-amber-400' : 'text-[var(--text)]'} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="surface-card p-5 hover:shadow-md transition-shadow duration-200">
          <h3 className="font-heading text-sm font-bold text-[var(--text)] mb-5">{t('admin.analytics.ordersByStatus')}</h3>
          <div className="space-y-3">
            {(data.ordersByStatus || []).map(s => {
              const colors = STATUS_COLORS[s.status] || {}
              return (
                <ChartBar key={s.status}
                  label={statusMap[s.status] || s.status}
                  value={s.count}
                  max={data.totalOrders}
                  color={colors.bar}
                  bgClass={colors.bg}
                  labelClass={colors.text}
                />
              )
            })}
            {(!data.ordersByStatus || data.ordersByStatus.length === 0) && (
              <p className="text-xs text-[var(--muted)] text-center py-8">{t('admin.analytics.noOrders')}</p>
            )}
          </div>
        </div>

        <div className="surface-card p-5 hover:shadow-md transition-shadow duration-200">
          <h3 className="font-heading text-sm font-bold text-[var(--text)] mb-5">{t('admin.analytics.ordersByCategory')}</h3>
          <div className="space-y-3">
            {(data.ordersByCategory || []).map(c => (
              <ChartBar key={c.category}
                label={t('cat.' + c.category) || c.category}
                value={c.count}
                max={maxCategory}
                color="var(--accent)"
                bgClass="bg-[var(--accent-dim)]"
                labelClass="text-[var(--accent)]"
              />
            ))}
            {(!data.ordersByCategory || data.ordersByCategory.length === 0) && (
              <p className="text-xs text-[var(--muted)] text-center py-8">{t('admin.analytics.noCatData')}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
