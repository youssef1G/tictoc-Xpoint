import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { fetchComplaints, updateComplaintStatus, fetchReturns, updateReturnStatus } from '../../api.js'
import CustomSelect from '../../components/CustomSelect.jsx'

const STATUS_OPTIONS = [
  { value: 'pending',  label: '🕐 Pending'  },
  { value: 'resolved', label: '✅ Resolved' },
  { value: 'rejected', label: '❌ Rejected' },
]
const STATUS_BADGE = {
  pending:  'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800',
  resolved: 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800',
  rejected: 'bg-gray-50 text-gray-500 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700',
}

function formatDate(str) {
  if (!str) return '—'
  return new Date(str).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

function SupportCard({ item, onStatusChange, saving }) {
  return (
    <div className="surface-card p-5 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs text-[var(--muted)]">{item.id}</span>
          <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-semibold border ${STATUS_BADGE[item.status] || 'text-[var(--muted)] border-[var(--border)]'}`}>
            {item.status}
          </span>
        </div>
        <span className="text-[11px] text-[var(--muted)]">{formatDate(item.created_at)}</span>
      </div>
      <div className="text-sm space-y-1.5">
        {item.name && <p className="font-semibold text-[var(--text)]">{item.name}</p>}
        {item.phone && <p className="text-xs text-[var(--muted)]">{item.phone}</p>}
        {item.order_id && <p className="text-xs text-[var(--muted)]">Order: <span className="font-mono">{item.order_id}</span></p>}
        {item.reason && <p className="text-xs text-[var(--text)]"><span className="font-semibold">Reason:</span> {item.reason}</p>}
        {item.message && <p className="text-xs text-[var(--muted)]">{item.message}</p>}
        {item.details && <p className="text-xs text-[var(--muted)] italic">{item.details}</p>}
      </div>
      <div className="flex items-center gap-3 pt-3 border-t border-[var(--border)]">
        <div className="flex-1 min-w-[160px]">
          <CustomSelect value={item.status} onChange={val => onStatusChange(item.id, val)} options={STATUS_OPTIONS} />
        </div>
        {saving && <p className="text-xs text-[var(--muted)]">Saving...</p>}
      </div>
    </div>
  )
}

export default function AdminSupport() {
  const { token } = useAuth()
  const navigate = useNavigate()
  const [complaints, setComplaints] = useState([])
  const [returns, setReturns] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState({})
  const [tab, setTab] = useState('complaints')

  useEffect(() => {
    Promise.all([fetchComplaints(token), fetchReturns(token)])
      .then(([c, r]) => { setComplaints(c); setReturns(r) })
      .catch(err => { if (err.status === 401) navigate('/admin-access') })
      .finally(() => setLoading(false))
  }, [])

  async function handleComplaintStatus(id, status) {
    setSaving(s => ({ ...s, [id]: true }))
    try {
      const updated = await updateComplaintStatus(token, id, status)
      setComplaints(prev => prev.map(c => c.id === id ? { ...c, ...updated } : c))
    } catch (err) { if (err.status === 401) navigate('/admin-access') }
    finally { setSaving(s => ({ ...s, [id]: false })) }
  }

  async function handleReturnStatus(id, status) {
    setSaving(s => ({ ...s, [id]: true }))
    try {
      const updated = await updateReturnStatus(token, id, status)
      setReturns(prev => prev.map(r => r.id === id ? { ...r, ...updated } : r))
    } catch (err) { if (err.status === 401) navigate('/admin-access') }
    finally { setSaving(s => ({ ...s, [id]: false })) }
  }

  if (loading) return <p className="text-sm text-[var(--muted)] py-10 text-center">Loading...</p>

  const pendingComplaints = complaints.filter(c => c.status === 'pending').length
  const pendingReturns = returns.filter(r => r.status === 'pending').length

  return (
    <div>
      <div className="flex gap-2 mb-6">
        <button onClick={() => setTab('complaints')}
          className={`px-4 py-2 rounded-full text-[13px] font-medium transition-colors ${
            tab === 'complaints' ? 'bg-[var(--brand)] text-white' : 'text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--muted)]/10'
          }`}>
          Complaints {pendingComplaints > 0 && <span className="ml-1.5 bg-white text-[var(--brand)] text-[10px] rounded-full px-1.5 py-0.5">{pendingComplaints}</span>}
        </button>
        <button onClick={() => setTab('returns')}
          className={`px-4 py-2 rounded-full text-[13px] font-medium transition-colors ${
            tab === 'returns' ? 'bg-[var(--brand)] text-white' : 'text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--muted)]/10'
          }`}>
          Returns {pendingReturns > 0 && <span className="ml-1.5 bg-white text-[var(--brand)] text-[10px] rounded-full px-1.5 py-0.5">{pendingReturns}</span>}
        </button>
      </div>
      {tab === 'complaints' && (
        <div className="space-y-4">
          {complaints.length === 0
            ? <p className="text-sm text-[var(--muted)] text-center py-10">No complaints yet.</p>
            : complaints.map(c => <SupportCard key={c.id} item={c} onStatusChange={handleComplaintStatus} saving={saving[c.id]} />)}
        </div>
      )}
      {tab === 'returns' && (
        <div className="space-y-4">
          {returns.length === 0
            ? <p className="text-sm text-[var(--muted)] text-center py-10">No return requests yet.</p>
            : returns.map(r => <SupportCard key={r.id} item={r} onStatusChange={handleReturnStatus} saving={saving[r.id]} />)}
        </div>
      )}
    </div>
  )
}