import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { fetchProducts, deleteProduct, updateProduct } from '../../api.js'
import { useAuth } from '../../context/AuthContext.jsx'
import { useLocale } from '../../context/LocaleContext.jsx'
import { LoadingState, ErrorState } from '../../components/StatusStates.jsx'
import CustomSelect from '../../components/CustomSelect.jsx'

function SortIcon({ dir }) {
  return (
    <span className="inline-block ml-1 text-[10px] opacity-50">
      {dir === 'asc' ? '▲' : dir === 'desc' ? '▼' : '▽'}
    </span>
  )
}

export default function AdminProducts() {
  const { t, lang } = useLocale()
  const { token, logout } = useAuth()
  const navigate = useNavigate()
  const [products, setProducts] = useState([])
  const [status, setStatus] = useState('loading')
  const [deletingId, setDeletingId] = useState(null)
  const [error, setError] = useState(null)
  const [editingStockId, setEditingStockId] = useState(null)
  const [stockDraft, setStockDraft] = useState('')
  const [savingStockId, setSavingStockId] = useState(null)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [storeFilter, setStoreFilter] = useState('all')
  const [sort, setSort] = useState({ key: '', dir: '' })

  const load = () => {
    setStatus('loading')
    fetchProducts().then(d => { setProducts(d); setStatus('ready') }).catch(() => setStatus('error'))
  }
  useEffect(() => { load() }, [])

  const categories = useMemo(() => {
    const cats = [...new Set(products.map(p => p.category).filter(Boolean))]
    return cats.sort()
  }, [products])

  const toggleSort = (key) => {
    setSort(prev => ({
      key,
      dir: prev.key === key ? (prev.dir === 'asc' ? 'desc' : 'asc') : 'asc'
    }))
  }

  const filtered = useMemo(() => {
    let result = [...products]
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(p => p.name.toLowerCase().includes(q))
    }
    if (categoryFilter !== 'all') {
      result = result.filter(p => p.category === categoryFilter)
    }
    if (storeFilter !== 'all') {
      result = result.filter(p => p.store === storeFilter)
    }
    if (sort.key) {
      result.sort((a, b) => {
        const av = a[sort.key], bv = b[sort.key]
        if (av == null) return 1
        if (bv == null) return -1
        if (typeof av === 'string') {
          const cmp = av.localeCompare(bv)
          return sort.dir === 'asc' ? cmp : -cmp
        }
        return sort.dir === 'asc' ? av - bv : bv - av
      })
    }
    return result
  }, [products, search, categoryFilter, sort])

  function handleAuthError(err) {
    if (err.message?.toLowerCase().includes('expired') || err.message?.toLowerCase().includes('token')) {
      logout(); navigate('/admin-access'); return true
    }
    return false
  }

  const handleDelete = async (id, name) => {
    if (!window.confirm(t('admin.products.deleteConfirm', { name }))) return
    setDeletingId(id)
    try { await deleteProduct(token, id); setProducts(prev => prev.filter(p => p.id !== id)) }
    catch (err) { if (!handleAuthError(err)) setError(err.message) }
    finally { setDeletingId(null) }
  }

  function stepStock(delta) { setStockDraft(prev => String(Math.max(0, (prev === '' ? 0 : Number(prev)) + delta))) }
  function startEditStock(p) { setEditingStockId(p.id); setStockDraft(p.stock == null ? '' : String(p.stock)) }

  async function saveStock(p) {
    const stockValue = stockDraft === '' ? null : Number(stockDraft)
    if (stockValue === (p.stock ?? null)) { setEditingStockId(null); return }
    setSavingStockId(p.id)
    try {
      const updated = await updateProduct(token, p.id, { ...p, stock: stockValue })
      setProducts(prev => prev.map(x => x.id === p.id ? { ...x, stock: updated.stock } : x))
      setEditingStockId(null)
    } catch (err) { if (!handleAuthError(err)) setError(err.message) }
    finally { setSavingStockId(null) }
  }

  function stockBadge(stock) {
    if (stock == null) return <span className="text-[11px] text-[var(--muted)]">{t('admin.products.unlimited')}</span>
    if (stock === 0) return <span className="text-[11px] font-semibold bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 rounded-full px-2 py-0.5">{t('admin.products.out')}</span>
    if (stock <= 10) return <span className="text-[11px] font-semibold bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 rounded-full px-2 py-0.5">{t('admin.products.leftStock', { count: stock })}</span>
    return <span className="text-[11px] text-[var(--muted)]">{t('admin.products.inStock', { count: stock })}</span>
  }

  function SortTh({ label, sortKey }) {
    return (
      <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--muted)] cursor-pointer select-none hover:text-[var(--text)] transition-colors"
        onClick={() => toggleSort(sortKey)}>
        {label}
        {sort.key === sortKey ? <SortIcon dir={sort.dir} /> : <SortIcon dir="" />}
      </th>
    )
  }

  if (status === 'loading') return <LoadingState label={t('store.loading')} />
  if (status === 'error') return <ErrorState message={t('store.loadError')} onRetry={load} />

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-xl font-bold text-[var(--text)]">{t('admin.products.title')}</h2>
        <p className="text-xs text-[var(--muted)] mt-1">{t('admin.products.subtitle')}</p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative w-full sm:flex-1 sm:min-w-[200px] sm:max-w-xs">
          <svg xmlns="http://www.w3.org/2000/svg" className="absolute top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted)]" style={{ [lang === 'ar' ? 'right' : 'left']: '0.75rem' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
          </svg>
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder={t('admin.products.searchPlaceholder')}
            className="w-full text-sm bg-[var(--surface)] border border-[var(--border)] rounded-xl py-2.5 text-[var(--text)] placeholder:text-[var(--muted)]/50 focus:outline-none focus:border-[var(--brand)]"
            style={{ paddingLeft: lang === 'ar' ? '1rem' : '2.25rem', paddingRight: lang === 'ar' ? '2.25rem' : '1rem' }} />
        </div>
        <div className="w-full sm:w-[180px]">
          <CustomSelect value={categoryFilter} onChange={setCategoryFilter}
            options={[{ value: 'all', label: t('admin.products.allCategories') }, ...categories.map(c => ({ value: c, label: t('cat.' + c) || c }))]}
            placeholder={t('admin.products.allCategories')} />
        </div>
        <div className="w-full sm:w-[140px]">
          <CustomSelect value={storeFilter} onChange={setStoreFilter}
            options={[
              { value: 'all', label: t('admin.products.allStores') },
              { value: 'xpoint', label: t('admin.products.xpoint') },
              { value: 'tictoc', label: t('admin.products.tictoc') },
            ]}
            placeholder={t('admin.products.allStores')} />
        </div>
        <div className="hidden sm:block flex-1" />
        <p className="text-xs text-[var(--muted)] sm:self-center">{t('admin.products.count', { count: filtered.length, total: products.length, s: products.length !== 1 ? 's' : '' })}</p>
        <Link to="/admin/products/new" className="btn-primary text-xs">{t('admin.products.addProduct')}</Link>
      </div>

      {error && <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">{error}</p>}

      {filtered.length === 0 ? (
        <div className="surface-card p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[var(--brand-dim)] flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-[var(--brand)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <p className="text-sm font-medium text-[var(--text)] mb-1">{t('admin.products.noProducts')}</p>
          <p className="text-xs text-[var(--muted)] mb-4">
            {search || categoryFilter !== 'all' ? t('admin.products.noFilter') : t('admin.products.firstProduct')}
          </p>
          {!search && categoryFilter === 'all' && (
            <Link to="/admin/products/new" className="btn-primary text-xs">{t('admin.products.addProduct')}</Link>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-[var(--border)]">
          <table className="w-full text-sm">
            <thead className="bg-[var(--muted)]/5 text-left">
              <tr>
                <SortTh label={t('admin.products.product')} sortKey="name" />
                <th scope="col" className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--muted)] cursor-pointer select-none hover:text-[var(--text)] transition-colors hidden md:table-cell" onClick={() => toggleSort('store')}>
                  {t('admin.products.store')}{sort.key === 'store' ? <SortIcon dir={sort.dir} /> : <SortIcon dir="" />}
                </th>
                <th scope="col" className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--muted)] cursor-pointer select-none hover:text-[var(--text)] transition-colors hidden md:table-cell" onClick={() => toggleSort('category')}>
                  {t('admin.products.category')}{sort.key === 'category' ? <SortIcon dir={sort.dir} /> : <SortIcon dir="" />}
                </th>
                <SortTh label={t('admin.products.price')} sortKey="price" />
                <th scope="col" className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--muted)] cursor-pointer select-none hover:text-[var(--text)] transition-colors hidden sm:table-cell" onClick={() => toggleSort('stock')}>
                  {t('admin.products.stock')}{sort.key === 'stock' ? <SortIcon dir={sort.dir} /> : <SortIcon dir="" />}
                </th>
                <th scope="col" className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--muted)] text-right">{t('admin.products.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id} className="border-t border-[var(--border)] hover:bg-[var(--muted)]/5 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img src={p.images?.[0] || p.image} alt={p.name}
                        className="h-10 w-10 rounded-xl object-cover bg-[var(--muted)]/5 shrink-0" />
                      <div>
                        <span className="text-[13px] font-semibold text-[var(--text)]">{p.name}</span>
                        {p.tag && <span className="ml-2 text-[10px] font-semibold text-[var(--brand)] uppercase">{p.tag}</span>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className={`text-[11px] font-semibold ${p.store === 'tictoc' ? 'text-[var(--brand)]' : 'text-[var(--accent)]'}`}>
                      {p.store === 'tictoc' ? t('admin.products.tictoc') : t('admin.products.xpoint')}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-[var(--muted)] hidden md:table-cell">{t('cat.' + p.category) || p.category}</td>
                  <td className="px-4 py-3 text-xs font-semibold text-[var(--text)]">{t('currency.egp', { amount: Number(p.price).toFixed(0) })}</td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    {editingStockId === p.id ? (
                      <div className="flex items-center gap-2">
                        <div className="flex items-center rounded-xl border border-[var(--border)] overflow-hidden">
                          <button type="button" onClick={() => stepStock(-1)}
                            className="w-7 h-7 flex items-center justify-center text-[var(--text)] hover:bg-[var(--muted)]/10 transition shrink-0">−</button>
                          <input type="number" min="0" value={stockDraft}
                            onChange={e => setStockDraft(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter') saveStock(p); if (e.key === 'Escape') setEditingStockId(null) }}
                            className="w-12 text-center text-xs py-1 bg-transparent text-[var(--text)] focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                          <button type="button" onClick={() => stepStock(1)}
                            className="w-7 h-7 flex items-center justify-center text-[var(--text)] hover:bg-[var(--muted)]/10 transition shrink-0">+</button>
                        </div>
                        <button onClick={() => saveStock(p)} disabled={savingStockId === p.id}
                          className="text-[11px] text-white bg-[var(--brand)] hover:bg-[#86013D] rounded-lg px-2 py-1.5 transition disabled:opacity-50">
                          {savingStockId === p.id ? '...' : '✓'}
                        </button>
                        <button onClick={() => setEditingStockId(null)}
                          className="text-xs text-[var(--muted)] hover:text-[var(--text)]">✕</button>
                      </div>
                    ) : (
                      <button onClick={() => startEditStock(p)} className="flex items-center gap-1.5 group">
                        {stockBadge(p.stock)}
                        <span className="text-[10px] text-[var(--muted)]/30 group-hover:text-[var(--brand)] transition">✎</span>
                      </button>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-4">
                      <Link to={`/admin/products/${p.id}/edit`}
                        className="text-xs font-medium text-[var(--brand)] hover:underline">{t('admin.products.edit')}</Link>
                      <button onClick={() => handleDelete(p.id, p.name)} disabled={deletingId === p.id}
                        className="text-xs text-[var(--muted)] hover:text-red-500 transition-colors disabled:opacity-50">
                        {deletingId === p.id ? t('admin.products.deleting') : t('admin.products.delete')}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}