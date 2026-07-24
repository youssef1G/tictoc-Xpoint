import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { useLocale } from '../../context/LocaleContext.jsx'
import { fetchAdmins, createAdmin, deleteAdmin, changeAdminPassword } from '../../api.js'

export default function AdminManage() {
  const { token } = useAuth()
  const { t } = useLocale()
  const navigate = useNavigate()
  const [admins, setAdmins] = useState([])
  const [loading, setLoading] = useState(true)
  const [newUsername, setNewUsername] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState('')
  const [confirmDeleteId, setConfirmDeleteId] = useState(null)
  const [changingPasswordId, setChangingPasswordId] = useState(null)
  const [newPw, setNewPw] = useState('')
  const [pwError, setPwError] = useState('')
  const [pwSaving, setPwSaving] = useState(false)
  const [pwSuccess, setPwSuccess] = useState(false)

  useEffect(() => {
    fetchAdmins(token)
      .then(setAdmins)
      .catch(err => { if (err.status === 401) navigate('/admin-access') })
      .finally(() => setLoading(false))
  }, [])

  async function handleCreate(e) {
    e.preventDefault(); setCreateError('')
    if (newUsername.length < 3) { setCreateError(t('admin.manage.usernameError')); return }
    if (newPassword.length < 8) { setCreateError(t('admin.manage.passwordError')); return }
    setCreating(true)
    try {
      const admin = await createAdmin(token, { username: newUsername, password: newPassword })
      setAdmins(prev => [...prev, admin])
      setNewUsername(''); setNewPassword('')
    } catch (err) { setCreateError(err.message || t('admin.manage.createError')) }
    finally { setCreating(false) }
  }

  async function handleDelete(id) {
    try {
      await deleteAdmin(token, id)
      setAdmins(prev => prev.filter(a => a.id !== id))
      setConfirmDeleteId(null)
    } catch (err) { if (err.status === 401) navigate('/admin-access') }
  }

  async function handleChangePassword(id) {
    setPwError('')
    if (newPw.length < 8) { setPwError(t('admin.manage.passwordError')); return }
    setPwSaving(true)
    try {
      await changeAdminPassword(token, id, newPw)
      setPwSuccess(true)
      setTimeout(() => { setChangingPasswordId(null); setPwSuccess(false); setNewPw('') }, 1500)
    } catch (err) { setPwError(err.message || t('admin.manage.changeError')) }
    finally { setPwSaving(false) }
  }

  const inputCls = 'w-full rounded-xl border border-[var(--border)] px-4 py-3 text-sm bg-[var(--surface)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--brand)]'

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h2 className="font-heading text-lg font-semibold text-[var(--text)] mb-4">{t('admin.manage.addAdmin')}</h2>
        <form onSubmit={handleCreate} className="surface-card p-5 space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[var(--text)] mb-1.5">{t('admin.manage.username')}</label>
              <input type="text" value={newUsername} onChange={e => setNewUsername(e.target.value)}
                placeholder={t('admin.manage.usernamePlaceholder')} className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--text)] mb-1.5">{t('admin.manage.password')}</label>
              <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)}
                placeholder={t('admin.manage.passwordPlaceholder')} className={inputCls} />
            </div>
          </div>
          {createError && <p className="text-xs text-red-500">{createError}</p>}
          <button type="submit" disabled={creating}
            className="btn-primary text-sm disabled:opacity-50">
            {creating ? t('admin.manage.creating') : t('admin.manage.add')}
          </button>
        </form>
      </div>

      <div>
        <h2 className="font-heading text-lg font-semibold text-[var(--text)] mb-4">{t('admin.manage.existing')}</h2>
        {loading ? <p className="text-xs text-[var(--muted)]">{t('status.loading')}</p> : admins.length === 0 ? (
          <p className="text-sm text-[var(--muted)]">{t('admin.manage.noAdmins')}</p>
        ) : (
          <div className="space-y-3">
            {admins.map(admin => (
              <div key={admin.id} className="surface-card p-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[var(--brand-dim)] flex items-center justify-center text-[var(--brand)] font-bold text-sm">
                      {admin.username[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[var(--text)]">{admin.username}</p>
                      <p className="text-[11px] text-[var(--muted)]">
                        {new Date(admin.created_at).toLocaleDateString('en-GB')}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button onClick={() => {
                      setChangingPasswordId(changingPasswordId === admin.id ? null : admin.id)
                      setPwError(''); setNewPw(''); setPwSuccess(false)
                    }}
                      className="text-[11px] font-medium text-[var(--brand)] border border-[var(--brand)]/30 rounded-full px-3 py-1 hover:bg-[var(--brand-dim)] transition-colors">
                      {t('admin.manage.changePassword')}
                    </button>
                    {confirmDeleteId === admin.id ? (
                      <div className="flex gap-1">
                        <button onClick={() => handleDelete(admin.id)}
                          className="text-[11px] text-white bg-red-500 hover:bg-red-600 rounded-full px-3 py-1 transition-colors">{t('admin.manage.confirm')}</button>
                        <button onClick={() => setConfirmDeleteId(null)}
                          className="text-[11px] text-[var(--muted)] border border-[var(--border)] rounded-full px-3 py-1 hover:bg-[var(--muted)]/10 transition-colors">{t('admin.form.cancel')}</button>
                      </div>
                    ) : (
                      <button onClick={() => setConfirmDeleteId(admin.id)}
                        className="text-[11px] text-[var(--muted)] border border-[var(--border)] rounded-full px-3 py-1 hover:text-red-500 transition-colors">{t('admin.manage.remove')}</button>
                    )}
                  </div>
                </div>
                {changingPasswordId === admin.id && (
                  <div className="mt-3 pt-3 border-t border-[var(--border)] space-y-3">
                    <input type="password" value={newPw} onChange={e => setNewPw(e.target.value)}
                      placeholder={t('admin.manage.newPasswordPlaceholder')} className={inputCls} />
                    {pwError && <p className="text-xs text-red-500">{pwError}</p>}
                    {pwSuccess && <p className="text-xs text-green-600">{t('admin.manage.passwordChanged')}</p>}
                    <button onClick={() => handleChangePassword(admin.id)} disabled={pwSaving}
                      className="btn-primary text-xs disabled:opacity-50">
                      {pwSaving ? t('admin.orders.saving') : t('admin.manage.savePassword')}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}