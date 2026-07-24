import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { useLocale } from '../context/LocaleContext.jsx'
import Seo from '../components/Seo.jsx'

export default function AdminAccess() {
  const { login, isAuthenticated } = useAuth()
  const { t } = useLocale()
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (isAuthenticated) { navigate('/admin', { replace: true }); return null }

  async function handleSubmit(e) {
    e.preventDefault()
    setError(''); setLoading(true)
    try { await login(username, password); navigate('/admin', { replace: true }) }
    catch { setError(t('adminAccess.error')) }
    finally { setLoading(false) }
  }

  return (
    <>
      <Seo title={t('admin.accessTitle')} noindex />
      <div className="min-h-screen flex items-center justify-center px-5 bg-[var(--bg)]">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <img src="/logo.jpg" alt={t('brand.tictoc') + ' ' + t('brand.xpoint')} className="w-14 h-14 rounded-xl object-cover mx-auto mb-4" />
          <h1 className="font-heading text-[22px] font-bold tracking-tight text-[var(--text)]">{t('admin.accessTitle')}</h1>
          <p className="text-xs text-[var(--muted)] mt-1">{t('admin.accessSubtitle')}</p>
        </div>
        <form onSubmit={handleSubmit} className="surface-card p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[var(--text)] mb-1.5">{t('adminAccess.username')}</label>
            <input type="text" value={username} onChange={e => setUsername(e.target.value)} required
              className="w-full rounded-xl border border-[var(--border)] px-4 py-3 text-sm bg-[var(--surface)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--brand)]" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[var(--text)] mb-1.5">{t('adminAccess.password')}</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
              className="w-full rounded-xl border border-[var(--border)] px-4 py-3 text-sm bg-[var(--surface)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--brand)]" />
          </div>
          {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">{error}</p>}
          <button type="submit" disabled={loading}
            className="btn-primary w-full py-3 text-sm disabled:opacity-50">
            {loading ? t('adminAccess.loggingIn') : t('adminAccess.login')}
          </button>
        </form>
      </div>
    </div>
    </>
  )
}