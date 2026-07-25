import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext.jsx'
import { useLocale } from '../../context/LocaleContext.jsx'
import { fetchAnalytics } from '../../api.js'
import CustomSelect from '../../components/CustomSelect.jsx'
import { ShoppingCart, TrendingUp, Receipt, Target, Package, Clock } from 'lucide-react'

const STATUS_META = {
  pending:   { color: '#F59E0B', labelKey: 'order.statusPending' },
  confirmed: { color: '#3B82F6', labelKey: 'order.statusConfirmed' },
  shipped:   { color: '#8B5CF6', labelKey: 'order.statusShipped' },
  delivered: { color: '#10B981', labelKey: 'order.statusDelivered' },
  cancelled: { color: '#6B7280', labelKey: 'order.statusCancelled' },
}

const STAT_CONFIG = [
  { key: 'orders',     icon: ShoppingCart, accent: false, labelKey: 'admin.analytics.totalOrders',     valueKey: 'totalOrders' },
  { key: 'revenue',    icon: TrendingUp,   accent: true,  labelKey: 'admin.analytics.revenue',         valueKey: 'totalRevenue' },
  { key: 'average',    icon: Receipt,      accent: false, labelKey: 'admin.analytics.avgOrder',        valueKey: 'avgOrderValue' },
  { key: 'completion', icon: Target,       accent: false, labelKey: 'admin.analytics.completionRate',  valueKey: 'completionRate' },
]

function formatValue(key, val, t) {
  if (key === 'revenue') return `EGP ${Number(val || 0).toFixed(0)}`
  if (key === 'average') return `EGP ${Number(val || 0).toFixed(0)}`
  if (key === 'completion') return val != null ? `${val}%` : '\u2014'
  return val || 0
}

function AnimatedBar({ label, value, max, color }) {
  const [fill, setFill] = useState(false)
  const pct = max > 0 ? (value / max) * 100 : 0

  useEffect(() => {
    const id = requestAnimationFrame(() => setFill(true))
    return () => cancelAnimationFrame(id)
  }, [])

  return (
    <div className="animate-fade-in flex items-center gap-3 py-0.5">
      <span className="text-xs text-[var(--muted)] w-20 shrink-0 truncate font-medium capitalize">
        {label}
      </span>
      <div className="flex-1 relative">
        <div className="h-8 rounded-lg bg-[var(--muted)]/8 overflow-hidden">
          <div
            className="h-full rounded-lg transition-all duration-700 ease-out"
            style={{
              width: fill ? `${Math.max(pct, 2)}%` : '0%',
              background: `linear-gradient(135deg, ${color}, ${color}cc)`,
            }}
          />
        </div>
      </div>
      <div className="flex items-center gap-2 min-w-[5rem] justify-end">
        <span className="text-xs font-semibold text-[var(--text)] tabular-nums">{value}</span>
        <span className="text-[10px] text-[var(--muted)] font-medium tabular-nums w-8 text-right">
          {Math.round(pct)}%
        </span>
      </div>
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

  if (loading) return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="h-6 w-40 bg-[var(--muted)]/10 rounded animate-pulse mb-2" />
          <div className="h-3 w-56 bg-[var(--muted)]/10 rounded animate-pulse" />
        </div>
        <div className="w-full sm:w-[180px] h-11 rounded-xl bg-[var(--muted)]/10 animate-pulse" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="surface-card p-5 animate-pulse">
            <div className="w-9 h-9 rounded-xl bg-[var(--muted)]/10 mb-3" />
            <div className="h-3 w-20 bg-[var(--muted)]/10 rounded mb-2" />
            <div className="h-7 w-24 bg-[var(--muted)]/10 rounded" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="surface-card p-5">
            <div className="h-4 w-36 bg-[var(--muted)]/10 rounded animate-pulse mb-5" />
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, j) => (
                <div key={j} className="flex items-center gap-3 animate-pulse">
                  <div className="h-3 w-20 bg-[var(--muted)]/10 rounded" />
                  <div className="flex-1 h-8 rounded-lg bg-[var(--muted)]/8" />
                  <div className="h-3 w-20 bg-[var(--muted)]/10 rounded" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  if (!data) return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-xl font-bold text-[var(--text)]">{t('admin.analytics.title')}</h2>
        <p className="text-xs text-[var(--muted)] mt-1">{t('admin.analytics.subtitle')}</p>
      </div>
      <div className="surface-card p-12 text-center">
        <div className="w-14 h-14 rounded-2xl bg-[var(--brand-dim)] flex items-center justify-center mx-auto mb-4">
          <TrendingUp size={22} className="text-[var(--brand)]" strokeWidth={1.5} />
        </div>
        <p className="text-sm font-medium text-[var(--text)] mb-1">{t('admin.analytics.noData')}</p>
      </div>
    </div>
  )

  const maxStatus = Math.max(1, ...(data.ordersByStatus || []).map(s => s.count))
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
        {STAT_CONFIG.map((cfg, i) => {
          const Icon = cfg.icon
          const val = formatValue(cfg.key, data[cfg.valueKey], t)
          return (
            <div
              key={cfg.key}
              className="surface-card p-5"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 rounded-xl bg-[var(--brand-dim)] flex items-center justify-center">
                  <Icon size={16} className="text-[var(--brand)]" strokeWidth={1.5} />
                </div>
              </div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--muted)] mb-0.5">
                {t(cfg.labelKey)}
              </p>
              <p className={`font-heading text-2xl font-bold tracking-tight ${cfg.accent ? 'text-[var(--brand)]' : 'text-[var(--text)]'}`}>
                {val}
              </p>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="surface-card p-5">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-heading text-sm font-bold text-[var(--text)]">{t('admin.analytics.ordersByStatus')}</h3>
          </div>
          {data.ordersByStatus?.length > 0 ? (
            <div className="space-y-1">
              {data.ordersByStatus.map((s) => {
                const meta = STATUS_META[s.status] || { color: 'var(--brand)', labelKey: null }
                return (
                  <AnimatedBar
                    key={s.status}
                    label={meta.labelKey ? t(meta.labelKey) : s.status}
                    value={s.count}
                    max={maxStatus}
                    color={meta.color}
                  />
                )
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center py-10 text-center gap-2">
              <Clock size={20} className="text-[var(--muted)]/40" strokeWidth={1.5} />
              <p className="text-xs text-[var(--muted)]">{t('admin.analytics.noOrders')}</p>
            </div>
          )}
        </div>

        <div className="surface-card p-5">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-heading text-sm font-bold text-[var(--text)]">{t('admin.analytics.ordersByCategory')}</h3>
          </div>
          {data.ordersByCategory?.length > 0 ? (
            <div className="space-y-1">
              {data.ordersByCategory.map((c) => (
                <AnimatedBar
                  key={c.category}
                  label={t('cat.' + c.category) || c.category}
                  value={c.count}
                  max={maxCategory}
                  color="var(--accent)"
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center py-10 text-center gap-2">
              <Package size={20} className="text-[var(--muted)]/40" strokeWidth={1.5} />
              <p className="text-xs text-[var(--muted)]">{t('admin.analytics.noCatData')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}