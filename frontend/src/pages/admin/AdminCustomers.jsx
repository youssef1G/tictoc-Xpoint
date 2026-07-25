import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { useAuth } from '../../context/AuthContext.jsx'
import { useLocale } from '../../context/LocaleContext.jsx'
import { fetchCustomers } from '../../api.js'
import { LoadingState } from '../../components/StatusStates.jsx'

function formatDate(str) {
  if (!str) return '—'
  return new Date(str).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function AdminCustomers() {
  const { token } = useAuth()
  const { t } = useLocale()
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const load = (q) => {
    setLoading(true)
    fetchCustomers(token, q)
      .then(setCustomers)
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { load('') }, [])

  function handleSearch(e) {
    e.preventDefault()
    load(search)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.35 }}
      >
        <h2 className="font-heading text-xl font-bold text-[var(--text)]">{t('admin.customers.title')}</h2>
        <p className="text-xs text-[var(--muted)] mt-1">{t('admin.customers.subtitle')}</p>
      </motion.div>

      <motion.form
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.35 }}
        onSubmit={handleSearch} className="flex gap-2"
      >
        <input type="text" value={search} onChange={e => setSearch(e.target.value)}
          placeholder={t('admin.customers.searchPlaceholder')}
          className="flex-1 max-w-xs text-sm bg-[var(--surface)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-[var(--text)] placeholder:text-[var(--muted)]/50 focus:outline-none focus:border-[var(--brand)]" />
        <button type="submit" className="btn-primary text-xs px-5 py-2.5">{t('admin.customers.search')}</button>
      </motion.form>

      {loading ? <LoadingState label={t('admin.customers.loading')} /> : (
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="overflow-x-auto rounded-xl border border-[var(--border)]"
        >
          <table className="w-full text-sm">
            <thead className="bg-[var(--muted)]/5 text-left">
              <tr>
                <th scope="col" className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--muted)]">{t('admin.customers.name')}</th>
                <th scope="col" className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--muted)]">{t('admin.customers.phone')}</th>
                <th scope="col" className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--muted)] hidden sm:table-cell">{t('admin.customers.orders')}</th>
                <th scope="col" className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--muted)] hidden sm:table-cell">{t('admin.customers.totalSpent')}</th>
                <th scope="col" className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--muted)] hidden sm:table-cell">{t('admin.customers.lastOrder')}</th>
                <th scope="col" className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--muted)] hidden md:table-cell">{t('admin.customers.joined')}</th>
              </tr>
            </thead>
            <tbody>
              {customers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-sm text-[var(--muted)]">
                    {t('admin.customers.noCustomers')}
                  </td>
                </tr>
              ) : customers.map((c, idx) => (
                <motion.tr
                  key={c.phone}
                  initial={{ opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: idx * 0.04 }}
                  className="border-t border-[var(--border)] hover:bg-[var(--muted)]/5 transition-colors"
                >
                  <td className="px-4 py-3 text-sm font-medium text-[var(--text)]">{c.name || '—'}</td>
                  <td className="px-4 py-3 text-xs text-[var(--muted)]">{c.phone}</td>
                  <td className="px-4 py-3 text-xs font-semibold text-[var(--text)] hidden sm:table-cell">{c.order_count || 0}</td>
                  <td className="px-4 py-3 text-xs font-semibold text-[var(--text)] hidden sm:table-cell">EGP {Number(c.total_spent || 0).toFixed(0)}</td>
                  <td className="px-4 py-3 text-xs text-[var(--muted)] hidden sm:table-cell">{formatDate(c.last_order_date)}</td>
                  <td className="px-4 py-3 text-xs text-[var(--muted)] hidden md:table-cell">{formatDate(c.created_at)}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      )}
    </motion.div>
  )
}
