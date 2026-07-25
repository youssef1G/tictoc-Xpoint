import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { fetchAdminCategories, createCategory, updateCategory, deleteCategory } from '../../api.js'
import { useAuth } from '../../context/AuthContext.jsx'
import { useLocale } from '../../context/LocaleContext.jsx'
import { ErrorState } from '../../components/StatusStates.jsx'
import CustomSelect from '../../components/CustomSelect.jsx'

export default function AdminCategories() {
  const { t } = useLocale()
  const { token, logout } = useAuth()
  const [categories, setCategories] = useState([])
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState(null)
  const [deletingName, setDeletingName] = useState(null)

  const [editingKey, setEditingKey] = useState(null)
  const [editDraftName, setEditDraftName] = useState('')
  const [editDraftStore, setEditDraftStore] = useState('xpoint')

  const [showCreate, setShowCreate] = useState(false)
  const [newName, setNewName] = useState('')
  const [newStore, setNewStore] = useState('xpoint')
  const [creating, setCreating] = useState(false)

  const load = () => {
    setStatus('loading')
    fetchAdminCategories(token).then(d => { setCategories(d); setStatus('ready') }).catch(() => setStatus('error'))
  }
  useEffect(() => { load() }, [])

  function handleAuthError(err) {
    if (err.message?.toLowerCase().includes('expired') || err.message?.toLowerCase().includes('token')) {
      logout(); return true
    }
    return false
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!newName.trim()) return
    setCreating(true)
    setError(null)
    try {
      const cat = await createCategory(token, { name: newName.trim(), store: newStore })
      setCategories(prev => [...prev, cat].sort((a, b) => a.name.localeCompare(b.name)))
      setNewName(''); setNewStore('xpoint'); setShowCreate(false)
    } catch (err) {
      if (!handleAuthError(err)) setError(err.message)
    } finally { setCreating(false) }
  }

  const handleDelete = async (name, store) => {
    if (!window.confirm(t('admin.categories.deleteConfirm', { name }))) return
    setDeletingName(name)
    setError(null)
    try {
      await deleteCategory(token, name, store)
      setCategories(prev => prev.filter(c => c.name !== name || c.store !== store))
    } catch (err) {
      if (!handleAuthError(err)) setError(err.message)
    } finally { setDeletingName(null) }
  }

  function startEdit(cat) {
    setEditingKey(cat.name + '|' + cat.store)
    setEditDraftName(cat.name)
    setEditDraftStore(cat.store)
  }

  const handleUpdate = async (originalName, originalStore) => {
    if (!editDraftName.trim()) return
    setError(null)
    try {
      const updated = await updateCategory(token, originalName, { name: editDraftName.trim(), store: editDraftStore })
      setCategories(prev => prev.map(c => (c.name === originalName && c.store === originalStore) ? updated : c).sort((a, b) => a.name.localeCompare(b.name)))
      setEditingKey(null)
    } catch (err) {
      if (!handleAuthError(err)) setError(err.message)
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4 }} className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.35 }}>
        <h2 className="font-heading text-xl font-bold text-[var(--text)]">{t('admin.categories.title')}</h2>
        <p className="text-xs text-[var(--muted)] mt-1">{t('admin.categories.subtitle')}</p>
      </motion.div>

      {status === 'error' && <ErrorState message={t('store.loadError')} onRetry={load} />}

      {error && <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">{error}</p>}

      <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.35 }} className="flex flex-wrap items-center gap-3">
        <div className="flex-1" />
        <p className="text-xs text-[var(--muted)]">{t('admin.categories.count', { count: categories.length })}</p>
        <button onClick={() => { setShowCreate(true); setNewName(''); setNewStore('xpoint') }} className="btn-primary text-xs">{t('admin.categories.addCategory')}</button>
      </motion.div>

      {showCreate && (
        <motion.form onSubmit={handleCreate} initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.25 }}
          className="surface-card p-4 flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--muted)] mb-1.5">{t('admin.categories.name')}</label>
            <input type="text" value={newName} onChange={e => setNewName(e.target.value)}
              placeholder={t('admin.categories.namePlaceholder')}
              className="w-full text-sm bg-[var(--surface)] border border-[var(--border)] rounded-xl py-2.5 px-3 text-[var(--text)] placeholder:text-[var(--muted)]/50 focus:outline-none focus:border-[var(--brand)]" />
          </div>
          <div className="w-full sm:w-[140px]">
            <label className="block text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--muted)] mb-1.5">{t('admin.categories.store')}</label>
            <CustomSelect value={newStore} onChange={setNewStore}
              options={[
                { value: 'xpoint', label: t('admin.categories.xpoint') },
                { value: 'tictoc', label: t('admin.categories.tictoc') },
              ]} />
          </div>
          <div className="flex items-center gap-2">
            <button type="submit" disabled={creating || !newName.trim()}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-medium text-white rounded-full transition-all disabled:opacity-50"
              style={{ background: 'var(--hot)' }}>
              {creating ? t('admin.categories.creating') : t('admin.categories.create')}
            </button>
            <button type="button" onClick={() => setShowCreate(false)}
              className="text-xs text-[var(--muted)] hover:text-[var(--text)] px-3 py-2.5">{t('admin.categories.cancel')}</button>
          </div>
        </motion.form>
      )}

      {status === 'loading' ? (
        <div className="overflow-x-auto rounded-xl border border-[var(--border)]">
          <table className="w-full text-sm">
            <thead className="bg-[var(--muted)]/5 text-left">
              <tr>
                <th scope="col" className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--muted)]">{t('admin.categories.name')}</th>
                <th scope="col" className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--muted)]">{t('admin.categories.store')}</th>
                <th scope="col" className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--muted)] text-right">{t('admin.categories.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 3 }).map((_, i) => (
                <tr key={i} className="border-t border-[var(--border)]">
                  <td className="px-4 py-3"><div className="h-4 w-32 bg-[var(--muted)]/10 rounded animate-pulse" /></td>
                  <td className="px-4 py-3"><div className="h-3 w-16 bg-[var(--muted)]/10 rounded animate-pulse" /></td>
                  <td className="px-4 py-3"><div className="h-3 w-16 bg-[var(--muted)]/10 rounded animate-pulse ml-auto" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : categories.length === 0 ? (
        <div className="surface-card p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[var(--brand-dim)] flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-[var(--brand)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </div>
          <p className="text-sm font-medium text-[var(--text)] mb-1">{t('admin.categories.noCategories')}</p>
          <p className="text-xs text-[var(--muted)] mb-4">{t('admin.categories.firstCategory')}</p>
          <button onClick={() => setShowCreate(true)} className="btn-primary text-xs">{t('admin.categories.addCategory')}</button>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-[var(--border)]">
          <table className="w-full text-sm">
            <thead className="bg-[var(--muted)]/5 text-left">
              <tr>
                <th scope="col" className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--muted)]">{t('admin.categories.name')}</th>
                <th scope="col" className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--muted)]">{t('admin.categories.store')}</th>
                <th scope="col" className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--muted)] text-right">{t('admin.categories.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat, idx) => (
                <motion.tr
                  key={cat.name + cat.store}
                  initial={{ opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: idx * 0.04 }}
                  className="border-t border-[var(--border)] hover:bg-[var(--muted)]/5 transition-colors"
                >
                  <td className="px-4 py-3">
                    {editingKey === cat.name + '|' + cat.store ? (
                      <input type="text" value={editDraftName} onChange={e => setEditDraftName(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') handleUpdate(cat.name, cat.store); if (e.key === 'Escape') setEditingKey(null) }}
                        className="w-full text-sm bg-[var(--surface)] border border-[var(--border)] rounded-lg py-1.5 px-2 text-[var(--text)] focus:outline-none focus:border-[var(--brand)]" />
                    ) : (
                      <span className="text-[13px] font-medium text-[var(--text)]">{t('cat.' + cat.name) || cat.name}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {editingKey === cat.name + '|' + cat.store ? (
                      <CustomSelect value={editDraftStore} onChange={setEditDraftStore}
                        options={[
                          { value: 'xpoint', label: t('admin.categories.xpoint') },
                          { value: 'tictoc', label: t('admin.categories.tictoc') },
                        ]} />
                    ) : (
                      <span className={`text-xs font-semibold ${cat.store === 'tictoc' ? 'text-[var(--brand)]' : 'text-[var(--accent)]'}`}>
                        {cat.store === 'tictoc' ? t('admin.categories.tictoc') : t('admin.categories.xpoint')}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    {editingKey === cat.name + '|' + cat.store ? (
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => handleUpdate(cat.name, cat.store)}
                          className="text-xs text-white bg-[var(--brand)] hover:bg-[#86013D] rounded-lg px-3 py-1.5 transition">{t('admin.categories.save')}</button>
                        <button onClick={() => setEditingKey(null)}
                          className="text-xs text-[var(--muted)] hover:text-[var(--text)]">{t('admin.categories.cancel')}</button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-end gap-4">
                        <button onClick={() => startEdit(cat)}
                          className="text-xs font-medium text-[var(--brand)] hover:underline">{t('admin.categories.edit')}</button>
                        <button onClick={() => handleDelete(cat.name, cat.store)} disabled={deletingName === cat.name}
                          className="text-xs text-[var(--muted)] hover:text-red-500 transition-colors disabled:opacity-50">
                          {deletingName === cat.name ? t('admin.categories.deleting') : t('admin.categories.delete')}
                        </button>
                      </div>
                    )}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </motion.div>
  )
}
