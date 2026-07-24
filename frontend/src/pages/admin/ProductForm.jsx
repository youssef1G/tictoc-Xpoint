import { useEffect, useMemo, useRef, useState, useCallback } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { ChevronDown, Search, Plus, X, Check, Infinity as InfinityIcon } from 'lucide-react'
import { fetchProduct, fetchCategories, createProduct, updateProduct, deleteProduct } from '../../api.js'
import { useAuth } from '../../context/AuthContext.jsx'
import { useLocale } from '../../context/LocaleContext.jsx'
import { LoadingState, ErrorState } from '../../components/StatusStates.jsx'
import ImageUploader from '../../components/ImageUploader.jsx'
import CustomSelect from '../../components/CustomSelect.jsx'

const emptyForm = {
  name: '', category: '', price: '', stock: '', tag: '',
  images: [], description: '', details: '', store: 'xpoint',
}

function formFromProduct(p) {
  return {
    name: p.name || '',
    category: p.category || '',
    price: String(p.price ?? ''),
    stock: p.stock == null ? '' : String(p.stock),
    tag: p.tag || '',
    images: p.images && p.images.length > 0 ? p.images : (p.image ? [p.image] : []),
    description: p.description || '',
    details: (p.details || []).join('\n'),
    store: p.store || 'xpoint',
  }
}

export default function ProductForm() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const { token, logout } = useAuth()
  const { t } = useLocale()
  const navigate = useNavigate()

  const [form, setForm] = useState(emptyForm)
  const [savedForm, setSavedForm] = useState(emptyForm)
  const [categories, setCategories] = useState([])
  const [status, setStatus] = useState(isEdit ? 'loading' : 'ready')
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState(null)
  const [errors, setErrors] = useState({})
  const [unlimitedStock, setUnlimitedStock] = useState(false)
  const [catOpen, setCatOpen] = useState(false)
  const [catQuery, setCatQuery] = useState('')
  const [catHighlight, setCatHighlight] = useState(0)
  const catRef = useRef(null)

  const isDirty = JSON.stringify(form) !== JSON.stringify(savedForm)

  const tagOptions = [
    { value: '', label: t('admin.form.none') },
    { value: 'New', label: t('admin.form.tagNew') },
    { value: 'Bestseller', label: t('admin.form.tagBestseller') },
  ]

  useEffect(() => {
    const handler = e => { if (!isDirty) return; e.preventDefault(); e.returnValue = '' }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [isDirty])

  useEffect(() => { fetchCategories().then(setCategories).catch(() => {}) }, [])

  useEffect(() => {
    if (!isEdit) return
    fetchProduct(id)
      .then(p => {
        const f = formFromProduct(p)
        setForm(f)
        setSavedForm(f)
        setUnlimitedStock(p.stock == null)
        setStatus('ready')
      })
      .catch(() => setStatus('error'))
  }, [id])

  useEffect(() => {
    function handleClick(e) { if (catRef.current && !catRef.current.contains(e.target)) setCatOpen(false) }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const filteredCats = useMemo(() => {
    if (!catQuery) return categories
    const q = catQuery.toLowerCase()
    return categories.filter(c => c.toLowerCase().includes(q))
  }, [categories, catQuery])

  const catShowCreate = catQuery && !categories.some(c => c.toLowerCase() === catQuery.toLowerCase())

  const catNavItems = useMemo(() => {
    const base = catQuery ? filteredCats : categories
    if (catShowCreate) return [...base, '__create__']
    return base
  }, [categories, filteredCats, catQuery, catShowCreate])

  const selectCategory = useCallback((c) => {
    setForm(p => ({ ...p, category: c }))
    setCatQuery('')
    setCatOpen(false)
    setCatHighlight(0)
    setErrors(p => ({ ...p, category: '' }))
  }, [])

  const handleCatKeyDown = e => {
    if (!catOpen) return
    if (e.key === 'ArrowDown') { e.preventDefault(); setCatHighlight(h => Math.min(h + 1, catNavItems.length - 1)) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setCatHighlight(h => Math.max(h - 1, 0)) }
    else if (e.key === 'Enter') {
      e.preventDefault()
      const item = catNavItems[catHighlight]
      if (item === '__create__') selectCategory(catQuery)
      else if (item) selectCategory(item)
    } else if (e.key === 'Escape') { setCatOpen(false) }
  }

  const set = field => val => setForm(prev => ({ ...prev, [field]: val }))
  const handleChange = field => e => { setErrors(p => ({ ...p, [field]: '' })); setForm(prev => ({ ...prev, [field]: e.target.value })) }

  const handleCancel = () => {
    if (isDirty && !window.confirm(t('admin.form.leaveConfirm'))) return
    navigate('/admin/products')
  }

  const handleDelete = async () => {
    if (!window.confirm(t('admin.form.deleteConfirm'))) return
    setDeleting(true)
    try {
      await deleteProduct(token, id)
      navigate('/admin/products')
    } catch (err) {
      if (err.status === 401) { logout(); navigate('/admin-access'); return }
      setError(err.message || 'Could not delete product.')
      setDeleting(false)
    }
  }

  const handleSubmit = async e => {
    e.preventDefault()
    setError(null)

    const newErrors = {}
    if (!form.name.trim()) newErrors.name = t('admin.form.required')
    if (!form.category.trim()) newErrors.category = t('admin.form.required')
    if (form.price === '' || isNaN(Number(form.price))) newErrors.price = t('admin.form.required')
    setErrors(newErrors)
    if (Object.keys(newErrors).length > 0) return

    const payload = {
      name: form.name.trim(),
      category: form.category.trim(),
      store: form.store || 'xpoint',
      price: Number(form.price),
      stock: unlimitedStock ? null : (form.stock === '' ? null : Number(form.stock)),
      tag: form.tag || null,
      images: form.images,
      image: form.images[0] || '',
      description: form.description,
      details: form.details.split('\n').map(d => d.trim()).filter(Boolean),
    }
    setSaving(true)
    try {
      if (isEdit) await updateProduct(token, id, payload)
      else await createProduct(token, payload)
      setSavedForm(form)
      navigate('/admin/products')
    } catch (err) {
      if (err.status === 401) { logout(); navigate('/admin-access'); return }
      setError(err.message || 'Could not save product.')
    } finally {
      setSaving(false)
    }
  }

  if (status === 'loading') return <LoadingState label={t('status.loading')} />
  if (status === 'error') return <ErrorState message={t('productDetail.loadError')} />

  const inputCls = (field) =>
    `w-full rounded-xl border px-4 py-3 text-sm bg-[var(--surface)] text-[var(--text)] placeholder:text-[var(--muted)]/50 focus:outline-none transition-colors ${
      errors[field]
        ? 'border-red-400 focus:ring-2 focus:ring-red-400'
        : 'border-[var(--border)] focus:ring-2 focus:ring-[var(--brand)]'
    }`

  const detailLines = form.details.split('\n').map(d => d.trim()).filter(Boolean)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h2 className="font-heading text-xl font-bold text-[var(--text)]">
            {isEdit ? t('admin.form.edit') : t('admin.form.add')}
          </h2>
          {isDirty && (
            <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400 border border-amber-200 rounded-full px-2.5 py-0.5">
              {t('admin.form.unsaved')}
            </span>
          )}
        </div>
        {isEdit && (
          <Link to={`/product/${id}`} target="_blank"
            className="text-xs font-medium text-[var(--brand)] hover:underline">
            {t('admin.form.viewStorefront')}
          </Link>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="surface-card p-5 space-y-5">
          <h3 className="font-heading text-sm font-bold text-[var(--text)]">{t('admin.form.basicInfo')}</h3>

          <div>
            <label className="block text-xs font-semibold text-[var(--text)] mb-1.5">{t('admin.form.name')}</label>
            <input type="text" value={form.name} onChange={handleChange('name')}
              className={inputCls('name')} placeholder={t('admin.form.namePlaceholder')} />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--text)] mb-1.5">{t('admin.form.store')}</label>
            <div className="flex gap-3">
              <label className={`flex-1 flex items-center justify-center gap-2 rounded-xl border py-3 text-sm font-semibold cursor-pointer transition-colors ${
                form.store === 'xpoint'
                  ? 'border-[var(--accent)] bg-[var(--accent-dim)] text-[var(--accent)]'
                  : 'border-[var(--border)] text-[var(--muted)] hover:border-[var(--accent)]/30 bg-[var(--surface)]'
              }`}>
                <input type="radio" name="store" value="xpoint" checked={form.store === 'xpoint'}
                  onChange={e => setForm(p => ({ ...p, store: e.target.value }))} className="sr-only" />
                {t('admin.form.xpoint')}
              </label>
              <label className={`flex-1 flex items-center justify-center gap-2 rounded-xl border py-3 text-sm font-semibold cursor-pointer transition-colors ${
                form.store === 'tictoc'
                  ? 'border-[var(--brand)] bg-[var(--brand-dim)] text-[var(--brand)]'
                  : 'border-[var(--border)] text-[var(--muted)] hover:border-[var(--brand)]/30 bg-[var(--surface)]'
              }`}>
                <input type="radio" name="store" value="tictoc" checked={form.store === 'tictoc'}
                  onChange={e => setForm(p => ({ ...p, store: e.target.value }))} className="sr-only" />
                {t('admin.form.tictoc')}
              </label>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div ref={catRef} className="relative">
              <label className="block text-xs font-semibold text-[var(--text)] mb-1.5">{t('admin.form.category')}</label>
              <div className={`flex items-center rounded-xl border bg-[var(--surface)] focus-within:ring-2 focus-within:ring-[var(--brand)] transition-colors ${
                errors.category ? 'border-red-400 ring-2 ring-red-400/20'
                  : catOpen ? 'border-[var(--brand)]' : 'border-[var(--border)]'
              }`}>
                <Search size={15} className="ml-3.5 text-[var(--muted)] shrink-0" />
                <input type="text" value={catOpen ? catQuery : (form.category ? t('cat.' + form.category) || form.category : '')}
                  onChange={e => { setCatQuery(e.target.value); handleChange('category')(e); setCatOpen(true) }}
                  onFocus={() => { setCatQuery(form.category); setCatOpen(true) }}
                  onKeyDown={handleCatKeyDown}
                  className="w-full text-sm py-3 px-2.5 bg-transparent text-[var(--text)] placeholder:text-[var(--muted)]/50 focus:outline-none focus:ring-0"
                  placeholder={t('admin.form.categorySearch')} autoComplete="off" />
                {form.category && (
                  <button type="button"
                    onClick={() => { setForm(p => ({ ...p, category: '' })); setCatQuery('') }}
                    className="mr-1 p-1.5 rounded-full text-[var(--muted)] hover:text-[var(--text)] hover:bg-gray-100 dark:hover:bg-gray-800 transition shrink-0">
                    <X size={14} />
                  </button>
                )}
                <ChevronDown size={16} onClick={() => setCatOpen(o => !o)}
                  className={`mr-3.5 text-[var(--muted)] shrink-0 cursor-pointer transition-transform duration-200 ${catOpen ? 'rotate-180' : ''}`} />
              </div>
              {catOpen && (
                <ul className="absolute z-50 mt-1.5 w-full bg-[var(--surface)] border border-[var(--border)] rounded-xl shadow-lg max-h-56 overflow-y-auto py-1">
                  {(catQuery ? filteredCats : categories).map((c) => (
                    <li key={c}>
                      <button type="button"
                        onClick={() => selectCategory(c)}
                        className={`w-full flex items-center justify-between gap-2 text-left px-4 py-2.5 text-sm transition-colors ${
                          c === form.category ? 'bg-brand-100 text-brand-700 dark:bg-brand-900/20 dark:text-brand-400 font-medium'
                            : 'text-[var(--text)] hover:bg-gray-100 dark:hover:bg-gray-800'
                        }`}>
                        <span className="truncate">{t('cat.' + c) || c}</span>
                        {c === form.category && <Check size={14} className="shrink-0" />}
                      </button>
                    </li>
                  ))}
                  {catShowCreate && (
                    <li className={categories.length > 0 ? 'border-t border-[var(--border)] mt-1 pt-1' : ''}>
                      <button type="button"
                        onClick={() => selectCategory(catQuery)}
                        className="w-full flex items-center gap-1.5 text-left px-4 py-2.5 text-sm font-medium text-brand-700 dark:text-brand-400 hover:bg-brand-100 dark:hover:bg-brand-900/20 transition-colors">
                        <Plus size={14} /> {t('admin.form.createCategory', { cat: catQuery })}
                      </button>
                    </li>
                  )}
                  {!catQuery && categories.length === 0 && (
                    <li className="px-4 py-3 text-xs text-[var(--muted)] text-center">{t('admin.form.noCategories')}</li>
                  )}
                </ul>
              )}
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--text)] mb-1.5">{t('admin.form.tag')}</label>
              <CustomSelect value={form.tag} onChange={v => { setForm(p => ({ ...p, tag: v })) }} options={tagOptions} placeholder={t('admin.form.none')} />
            </div>
          </div>
        </div>

        <div className="surface-card p-5 space-y-5">
          <h3 className="font-heading text-sm font-bold text-[var(--text)]">{t('admin.form.pricing')}</h3>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[var(--text)] mb-1.5">{t('admin.form.price')} <span className="text-[var(--muted)] font-normal">(EGP)</span></label>
              <div className={`flex items-center rounded-xl border overflow-hidden bg-[var(--surface)] transition-colors ${
                errors.price ? 'border-red-400 ring-2 ring-red-400/20' : 'border-[var(--border)]'
              }`}>
                <span className="pl-3.5 pr-2.5 text-sm text-[var(--muted)] font-semibold shrink-0 border-r border-[var(--border)] py-3">EGP</span>
                <input type="number" step="0.01" min="0" value={form.price}
                  onChange={handleChange('price')}
                  onKeyDown={e => {
                    if (e.key === 'ArrowUp') { e.preventDefault(); setForm(p => ({ ...p, price: String((Number(p.price) || 0) + 1) })); setErrors(prev => ({ ...prev, price: '' })) }
                    if (e.key === 'ArrowDown') { e.preventDefault(); setForm(p => ({ ...p, price: String(Math.max(0, (Number(p.price) || 0) - 1)) })); setErrors(prev => ({ ...prev, price: '' })) }
                  }}
                  className="w-full text-sm py-3 px-3 bg-transparent text-[var(--text)] placeholder:text-[var(--muted)]/50 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  placeholder={t('admin.form.pricePlaceholder')} />
              </div>
              {errors.price && <p className="mt-1.5 text-[11px] text-red-500">{t('admin.form.validPrice')}</p>}
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-[var(--text)]">{t('admin.form.stock')}</label>
                <label className="flex items-center gap-2 text-xs text-[var(--muted)] cursor-pointer select-none">
                  <InfinityIcon size={13} className={unlimitedStock ? 'text-[var(--brand)]' : ''} />
                  {t('admin.form.unlimited')}
                  <button type="button" role="switch" aria-checked={unlimitedStock}
                    onClick={() => { const next = !unlimitedStock; setUnlimitedStock(next); if (next) setForm(p => ({ ...p, stock: '' })) }}
                    className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${unlimitedStock ? 'bg-[var(--brand)]' : 'bg-[var(--muted)]/25'}`}>
                    <span className={`inline-block h-[14px] w-[14px] transform rounded-full bg-white shadow transition-transform ${unlimitedStock ? 'translate-x-[19px]' : 'translate-x-[3px]'}`} />
                  </button>
                </label>
              </div>
              <div className={`flex items-center rounded-xl border overflow-hidden bg-[var(--surface)] transition-colors ${
                unlimitedStock ? 'opacity-40 border-[var(--border)]' : 'border-[var(--border)]'
              }`}>
                <button type="button" onClick={() => { if (!unlimitedStock) { setForm(p => ({ ...p, stock: String(Math.max(0, (Number(p.stock) || 0) - 1)) })) } }}
                  disabled={unlimitedStock}
                  className="w-9 h-[44px] flex items-center justify-center text-sm text-[var(--muted)] hover:text-[var(--brand)] hover:bg-gray-100 dark:hover:bg-gray-800 transition shrink-0 disabled:cursor-not-allowed">−</button>
                <input type="number" min="0" value={form.stock}
                  onChange={handleChange('stock')}
                  disabled={unlimitedStock}
                  className="w-full text-sm py-3 text-center bg-transparent text-[var(--text)] placeholder:text-[var(--muted)]/50 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  placeholder={unlimitedStock ? t('admin.form.unlimited') : '0'} />
                <button type="button" onClick={() => { if (!unlimitedStock) { setForm(p => ({ ...p, stock: String((Number(p.stock) || 0) + 1) })) } }}
                  disabled={unlimitedStock}
                  className="w-9 h-[44px] flex items-center justify-center text-sm text-[var(--muted)] hover:text-[var(--brand)] hover:bg-gray-100 dark:hover:bg-gray-800 transition shrink-0 disabled:cursor-not-allowed">+</button>
              </div>
              {!unlimitedStock && form.stock === '0' && (
                <p className="mt-1.5 text-[11px] text-amber-600">{t('admin.form.outOfStock')}</p>
              )}
            </div>
          </div>
        </div>

        <div className="surface-card p-5 space-y-5">
          <h3 className="font-heading text-sm font-bold text-[var(--text)]">{t('admin.form.media')}</h3>
          <ImageUploader images={form.images} onChange={imgs => setForm(prev => ({ ...prev, images: imgs }))} />
        </div>

        <div className="surface-card p-5 space-y-5">
          <h3 className="font-heading text-sm font-bold text-[var(--text)]">{t('admin.form.details')}</h3>

          <div>
            <label className="block text-xs font-semibold text-[var(--text)] mb-1.5">{t('admin.form.description')}</label>
            <textarea value={form.description} onChange={handleChange('description')} rows={4}
              className={inputCls()} />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--text)] mb-1.5">{t('admin.form.features')}</label>
            <textarea value={form.details} onChange={handleChange('details')} rows={4}
              placeholder={t('admin.form.featuresPlaceholder')}
              className={inputCls()} />
            {detailLines.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {detailLines.map((d, i) => (
                  <span key={i} className="text-[11px] bg-[var(--brand-dim)] text-[var(--brand)] rounded-lg px-2.5 py-1">
                    {d}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {error && <p className="text-xs text-red-600 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3">{error}</p>}

        <div className="flex items-center justify-between">
          <div className="flex gap-3">
            <button type="submit" disabled={saving}
              className="btn-primary text-sm disabled:opacity-50">
              {saving ? t('admin.form.saving') : isEdit ? t('admin.form.saveEdit') : t('admin.form.saveAdd')}
            </button>
            <button type="button" onClick={handleCancel}
              className="btn-secondary text-sm">{t('admin.form.cancel')}</button>
          </div>
          {isEdit && (
            <button type="button" onClick={handleDelete} disabled={deleting}
              className="text-xs text-[var(--muted)] hover:text-red-500 transition-colors disabled:opacity-50">
              {deleting ? t('admin.form.deleting') : t('admin.form.deleteProduct')}
            </button>
          )}
        </div>
      </form>
    </div>
  )
}