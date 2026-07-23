import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext.jsx'
import { useLocale } from '../../context/LocaleContext.jsx'
import { fetchSettings, upsertSetting } from '../../api.js'
import { LoadingState } from '../../components/StatusStates.jsx'

export default function AdminSettings() {
  const { token } = useAuth()
  const { t } = useLocale()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [shipping, setShipping] = useState('')
  const [threshold, setThreshold] = useState('')

  useEffect(() => {
    fetchSettings(token)
      .then(data => {
        setShipping((data.find(d => d.key === 'shipping')?.value) ?? '')
        setThreshold((data.find(d => d.key === 'free_shipping_threshold')?.value) ?? '')
      })
      .catch(() => setError(t('admin.settings.loadError')))
      .finally(() => setLoading(false))
  }, [])

  async function save(key, value) {
    setError(''); setSuccess(''); setSaving(key)
    try {
      await upsertSetting(token, key, value || '0')
      const label = key === 'shipping' ? t('admin.settings.shippingFee') : t('admin.settings.freeThreshold')
      setSuccess(t('admin.settings.saveSuccess', { label }))
      setTimeout(() => setSuccess(''), 4000)
    } catch (err) {
      setError(err.message || t('admin.settings.saveError'))
    } finally {
      setSaving('')
    }
  }

  if (loading) return <LoadingState label={t('admin.settings.loading')} />

  const fee = Math.max(0, Number(shipping) || 0)
  const thresh = Math.max(0, Number(threshold) || 0)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-xl font-bold text-[var(--text)]">{t('admin.settings.title')}</h2>
        <p className="text-xs text-[var(--muted)] mt-1">{t('admin.settings.subtitle')}</p>
      </div>

      {error && <p className="text-xs text-red-600 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3">{error}</p>}
      {success && <p className="text-xs text-green-600 bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 rounded-xl px-4 py-3">{success}</p>}

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="surface-card p-6">
          <form onSubmit={e => { e.preventDefault(); save('shipping', shipping) }}>
            <label className="block text-xs font-semibold text-[var(--text)] mb-1.5">{t('admin.settings.shippingFee')}</label>
            <div className="flex items-center rounded-xl border border-[var(--border)] overflow-hidden bg-[var(--surface)] focus-within:ring-2 focus-within:ring-[var(--brand)] transition-colors">
              <span className="pl-3.5 pr-2.5 text-sm text-[var(--muted)] font-semibold shrink-0 border-r border-[var(--border)] py-3">EGP</span>
              <input type="number" min="0" step="1" value={shipping}
                onChange={e => setShipping(e.target.value)}
                className="w-full text-sm py-3 px-3 bg-transparent text-[var(--text)] placeholder:text-[var(--muted)]/50 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                placeholder="0" />
            </div>
            <p className="text-xs text-[var(--muted)] mt-2">{fee > 0 ? t('admin.settings.feePerOrder', { fee: fee.toFixed(0) }) : t('admin.settings.noFee')}</p>
            <button type="submit" disabled={saving === 'shipping'}
              className="btn-primary text-xs px-5 py-2.5 mt-3 disabled:opacity-50">
              {saving === 'shipping' ? t('admin.settings.saving') : t('admin.settings.save')}
            </button>
          </form>
        </div>

        <div className="surface-card p-6">
          <form onSubmit={e => { e.preventDefault(); save('free_shipping_threshold', threshold) }}>
            <label className="block text-xs font-semibold text-[var(--text)] mb-1.5">{t('admin.settings.freeThreshold')}</label>
            <div className="flex items-center rounded-xl border border-[var(--border)] overflow-hidden bg-[var(--surface)] focus-within:ring-2 focus-within:ring-[var(--brand)] transition-colors">
              <span className="pl-3.5 pr-2.5 text-sm text-[var(--muted)] font-semibold shrink-0 border-r border-[var(--border)] py-3">EGP</span>
              <input type="number" min="0" step="1" value={threshold}
                onChange={e => setThreshold(e.target.value)}
                className="w-full text-sm py-3 px-3 bg-transparent text-[var(--text)] placeholder:text-[var(--muted)]/50 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                placeholder="0" />
            </div>
            <p className="text-xs text-[var(--muted)] mt-2">
              {thresh > 0
                ? t('admin.settings.thresholdLabel', { amount: thresh.toFixed(0) })
                : t('admin.settings.noThreshold')}
            </p>
            <button type="submit" disabled={saving === 'free_shipping_threshold'}
              className="btn-primary text-xs px-5 py-2.5 mt-3 disabled:opacity-50">
              {saving === 'free_shipping_threshold' ? t('admin.settings.saving') : t('admin.settings.save')}
            </button>
          </form>
        </div>
      </div>

      <div className="surface-card p-5">
        <h3 className="font-heading text-sm font-bold text-[var(--text)] mb-3">{t('admin.settings.preview')}</h3>
        {thresh > 0 && fee > 0 ? (
          <div className="text-xs space-y-3">
            <div className="space-y-1.5">
              <p className="font-medium text-[var(--text)]">{t('admin.settings.belowThreshold', { amount: thresh.toFixed(0) })}</p>
              <div className="flex justify-between text-[var(--muted)]"><span>{t('admin.settings.subtotal')}</span><span>EGP {(thresh - 1).toFixed(0)}</span></div>
              <div className="flex justify-between text-[var(--muted)]"><span>{t('admin.settings.shipping')}</span><span>EGP {fee.toFixed(0)}</span></div>
              <div className="flex justify-between font-semibold text-[var(--text)] pt-1 border-t border-[var(--border)]"><span>{t('admin.settings.total')}</span><span>EGP {(thresh - 1 + fee).toFixed(0)}</span></div>
            </div>
            <div className="border-t border-[var(--border)] pt-3 space-y-1.5">
              <p className="font-medium text-green-600 dark:text-green-400">{t('admin.settings.aboveThreshold', { amount: thresh.toFixed(0) })}</p>
              <div className="flex justify-between text-[var(--muted)]"><span>{t('admin.settings.subtotal')}</span><span>EGP {thresh.toFixed(0)}</span></div>
              <div className="flex justify-between text-green-600 dark:text-green-400"><span>{t('admin.settings.shipping')}</span><span>{t('admin.settings.free')}</span></div>
              <div className="flex justify-between font-semibold text-[var(--text)] pt-1 border-t border-[var(--border)]"><span>{t('admin.settings.total')}</span><span>EGP {thresh.toFixed(0)}</span></div>
            </div>
          </div>
        ) : fee > 0 ? (
          <div className="text-xs space-y-1.5">
            <div className="flex justify-between text-[var(--muted)]"><span>{t('admin.settings.subtotal')}</span><span>EGP 0</span></div>
            <div className="flex justify-between text-[var(--muted)]"><span>{t('admin.settings.shipping')}</span><span>EGP {fee.toFixed(0)}</span></div>
            <div className="flex justify-between font-semibold text-[var(--text)] pt-1 border-t border-[var(--border)]"><span>{t('admin.settings.total')}</span><span>EGP {fee.toFixed(0)}</span></div>
          </div>
        ) : (
          <div className="text-xs space-y-1.5">
            <div className="flex justify-between text-[var(--muted)]"><span>{t('admin.settings.subtotal')}</span><span>EGP 0</span></div>
            <div className="flex justify-between text-[var(--muted)]"><span>{t('admin.settings.shipping')}</span><span>{t('admin.settings.free')}</span></div>
            <div className="flex justify-between font-semibold text-[var(--text)] pt-1 border-t border-[var(--border)]"><span>{t('admin.settings.total')}</span><span>EGP 0</span></div>
          </div>
        )}
      </div>
    </div>
  )
}
