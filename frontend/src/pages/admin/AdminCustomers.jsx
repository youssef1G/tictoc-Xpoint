import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext.jsx'
import { fetchCustomers } from '../../api.js'
import { LoadingState } from '../../components/StatusStates.jsx'

function formatDate(str) {
  if (!str) return '—'
  return new Date(str).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function AdminCustomers() {
  const { token } = useAuth()
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
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-xl font-bold text-[var(--text)]">Customers</h2>
        <p className="text-xs text-[var(--muted)] mt-1">Your customer base</p>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2">
        <input type="text" value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by name or phone..."
          className="flex-1 max-w-xs text-sm bg-[var(--surface)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-[var(--text)] placeholder:text-[var(--muted)]/50 focus:outline-none focus:border-[var(--brand)]" />
        <button type="submit" className="btn-primary text-xs px-5 py-2.5">Search</button>
      </form>

      {loading ? <LoadingState label="Loading customers..." /> : (
        <div className="overflow-x-auto rounded-xl border border-[var(--border)]">
          <table className="w-full text-sm">
            <thead className="bg-[var(--muted)]/5 text-left">
              <tr>
                <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--muted)]">Name</th>
                <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--muted)]">Phone</th>
                <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--muted)]">Orders</th>
                <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--muted)]">Total Spent</th>
                <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--muted)]">Last Order</th>
                <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--muted)]">Joined</th>
              </tr>
            </thead>
            <tbody>
              {customers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-sm text-[var(--muted)]">
                    No customers found.
                  </td>
                </tr>
              ) : customers.map(c => (
                <tr key={c.phone} className="border-t border-[var(--border)] hover:bg-[var(--muted)]/5 transition-colors">
                  <td className="px-4 py-3 text-sm font-medium text-[var(--text)]">{c.name || '—'}</td>
                  <td className="px-4 py-3 text-xs text-[var(--muted)]">{c.phone}</td>
                  <td className="px-4 py-3 text-xs font-semibold text-[var(--text)]">{c.order_count || 0}</td>
                  <td className="px-4 py-3 text-xs font-semibold text-[var(--text)]">EGP {Number(c.total_spent || 0).toFixed(0)}</td>
                  <td className="px-4 py-3 text-xs text-[var(--muted)]">{formatDate(c.last_order_date)}</td>
                  <td className="px-4 py-3 text-xs text-[var(--muted)]">{formatDate(c.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
