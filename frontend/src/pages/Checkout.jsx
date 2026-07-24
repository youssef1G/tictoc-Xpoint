import { useEffect, useState, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useCart } from '../context/CartContext.jsx'
import { useLocale } from '../context/LocaleContext.jsx'
import { createCodOrder } from '../api.js'

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:4242'

function validate(form, t) {
  const errors = {}
  if (!form.name.trim() || form.name.trim().length < 2) errors.name = t('checkout.nameError')
  if (!/^(010|011|012|015)\d{8}$/.test(form.phone.replace(/\s/g, ''))) errors.phone = t('checkout.phoneError')
  if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = t('checkout.emailError')
  if (!form.address.trim() || form.address.trim().length < 5) errors.address = t('checkout.streetError')
  if (!form.city.trim()) errors.city = t('checkout.cityError')
  return errors
}

function Field({ label, error, children }) {
  return (
    <div>
      <label className="block text-xs font-medium text-[var(--text)] mb-1.5">{label}</label>
      {children}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  )
}

export default function Checkout() {
  const { t } = useLocale()
  const { items, subtotal, clearCart } = useCart()
  const navigate = useNavigate()
  const egp = (amount) => t('currency.egp', { amount: Number(amount).toFixed(0) })
  const phoneRef = useRef()
  const emailRef = useRef()
  const addressRef = useRef()
  const cityRef = useRef()
  const next = (e, ref) => { if (e.key === 'Enter') { e.preventDefault(); ref.current?.focus() } }
  const [form, setForm]   = useState({ name: '', phone: '', email: '', address: '', city: '' })
  const [errors, setErrors]   = useState({})
  const [loading, setLoading] = useState(false)
  const [serverError, setServerError] = useState('')
  const [shippingFee, setShippingFee] = useState(0)
  const [freeThreshold, setFreeThreshold] = useState(0)
  const [baseShipping, setBaseShipping] = useState(0)
  const [settingsLoaded, setSettingsLoaded] = useState(false)

  useEffect(() => {
    fetch(`${BASE}/api/settings/public`)
      .then(r => r.json())
      .then(data => {
        const shipping = data.find(s => s.key === 'shipping')
        const threshold = data.find(s => s.key === 'free_shipping_threshold')
        const tVal = threshold ? Math.max(0, Number(threshold.value) || 0) : 0
        const sVal = shipping ? Math.max(0, Number(shipping.value) || 0) : 0
        setFreeThreshold(tVal)
        setBaseShipping(sVal)
        setShippingFee(tVal > 0 && subtotal >= tVal ? 0 : sVal)
        setSettingsLoaded(true)
      })
      .catch(() => setSettingsLoaded(true))
  }, [])

  useEffect(() => {
    if (!settingsLoaded) return
    setShippingFee(freeThreshold > 0 && subtotal >= freeThreshold ? 0 : baseShipping)
  }, [subtotal, settingsLoaded])

  const total = subtotal + shippingFee

  if (items.length === 0) return (
    <div className="max-w-xl mx-auto px-5 py-24 text-center">
      <h2 className="text-heading-lg text-[var(--text)] mb-3">{t('checkout.emptyCart')}</h2>
      <Link to="/shop" className="btn-primary text-sm">{t('checkout.shopNow')}</Link>
    </div>
  )

  const set = f => e => {
    setForm(p => ({ ...p, [f]: e.target.value }))
    if (errors[f]) setErrors(p => ({ ...p, [f]: '' }))
  }

  const inputCls = field =>
    `w-full rounded-xl border px-4 py-3 text-sm font-medium bg-[var(--surface)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--brand)] focus:border-[var(--brand)] transition ${
      errors[field] ? 'border-red-400' : 'border-[var(--border)]'
    }`

  async function handleSubmit(e) {
    e.preventDefault()
    setServerError('')
    const errs = validate(form, t)
    if (Object.keys(errs).length) { setErrors(errs); return }
    setLoading(true)
    try {
      const res = await createCodOrder({
        items: items.map(i => ({ id: i.id, quantity: i.quantity })),
        customer: form,
      })
      clearCart()
      navigate(`/checkout/success?method=cod&orderId=${res.orderId}`)
    } catch (err) {
      setServerError(err.message || t('checkout.somethingWentWrong'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-5 sm:px-8 py-10 sm:py-14">
      <nav className="flex items-center gap-2 text-xs text-[var(--muted)] mb-8">
        <Link to="/cart" className="hover:text-[var(--brand)]">{t('checkout.cart')}</Link>
        <span>/</span>
        <span className="text-[var(--text)]">{t('checkout.checkout')}</span>
      </nav>

      <div className="grid lg:grid-cols-5 gap-10">
        <form onSubmit={handleSubmit} className="lg:col-span-3 space-y-8" noValidate>
          <div>
            <h2 className="font-heading text-lg font-semibold text-[var(--text)] mb-4">{t('checkout.contactDetails')}</h2>
            <div className="space-y-4">
              <Field label={t('checkout.fullName')} error={errors.name}>
                  <input type="text" value={form.name} onChange={set('name')} onKeyDown={e => next(e, phoneRef)}
                  placeholder={t('checkout.namePlaceholder')} className={inputCls('name')} />
              </Field>
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label={t('checkout.phoneNumber')} error={errors.phone}>
                  <input ref={phoneRef} type="tel" value={form.phone} onChange={set('phone')} onKeyDown={e => next(e, emailRef)}
                    placeholder={t('checkout.phonePlaceholder')} className={inputCls('phone')} />
                </Field>
                <Field label={<>{t('checkout.email')} <span className="text-[var(--muted)] font-normal">{t('checkout.optional')}</span></>} error={errors.email}>
                  <input ref={emailRef} type="email" value={form.email} onChange={set('email')} onKeyDown={e => next(e, addressRef)}
                    placeholder={t('checkout.emailPlaceholder')} className={inputCls('email')} />
                </Field>
              </div>
            </div>
          </div>

          <div>
            <h2 className="font-heading text-lg font-semibold text-[var(--text)] mb-4">{t('checkout.deliveryAddress')}</h2>
            <div className="space-y-4">
              <Field label={t('checkout.streetAddress')} error={errors.address}>
                  <input ref={addressRef} type="text" value={form.address} onChange={set('address')} onKeyDown={e => next(e, cityRef)}
                    placeholder={t('checkout.streetPlaceholder')} className={inputCls('address')} />
              </Field>
              <Field label={t('checkout.city')} error={errors.city}>
                  <input ref={cityRef} type="text" value={form.city} onChange={set('city')}
                    placeholder={t('checkout.cityPlaceholder')} className={inputCls('city')} />
              </Field>
            </div>
          </div>

          <div className="flex items-start gap-3 bg-[var(--brand-dim)] border border-[var(--brand)]/10 rounded-2xl px-5 py-4">
            <span className="text-xl shrink-0">{'💵'}</span>
            <div>
              <p className="text-sm font-semibold text-[var(--text)]">{t('checkout.cod')}</p>
              <p className="text-xs text-[var(--muted)] mt-0.5">{t('checkout.codDesc')}</p>
            </div>
          </div>

          {serverError && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">{serverError}</p>
          )}

          <button type="submit" disabled={loading}
            className="btn-primary w-full py-3.5 text-sm disabled:opacity-50">
            {loading ? t('checkout.placingOrder') : t('checkout.placeOrder')}
          </button>
        </form>

        <div className="lg:col-span-2">
          <div className="sticky top-24 surface-card p-6">
            <h2 className="font-heading text-lg font-semibold text-[var(--text)] mb-4">{t('checkout.orderSummary')}</h2>
            <ul className="space-y-3 mb-4">
              {items.map(item => (
                <li key={item.id} className="flex items-center gap-3">
                  <img src={item.images?.[0] || item.image} alt={item.name}
                    className="w-12 h-12 rounded-xl object-cover border border-[var(--border)] shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-[var(--text)] truncate">{item.name}</p>
                    <p className="text-[11px] text-[var(--muted)]">{t('checkout.qty', { qty: item.quantity })}</p>
                  </div>
                  <span className="text-xs font-semibold text-[var(--text)] whitespace-nowrap">
                    {egp(item.price * item.quantity)}
                  </span>
                </li>
              ))}
            </ul>
            <div className="border-t border-[var(--border)] pt-4 space-y-2">
              <div className="flex justify-between text-xs text-[var(--muted)]">
                <span>{t('checkout.subtotal')}</span>
                <span>{egp(subtotal)}</span>
              </div>
              <div className="flex justify-between text-xs text-[var(--muted)]">
                <span>{t('checkout.shipping')}</span>
                <span>{settingsLoaded
                  ? (shippingFee > 0 ? egp(shippingFee)
                    : freeThreshold > 0 && subtotal >= freeThreshold ? `${t('checkout.free')} 🎉`
                    : t('checkout.free'))
                  : '...'}</span>
              </div>
              {settingsLoaded && freeThreshold > 0 && shippingFee > 0 && (
                <p className="text-[11px] text-amber-600 dark:text-amber-400">
                  {t('checkout.freeShippingThreshold', { threshold: freeThreshold.toFixed(0) })}
                </p>
              )}
              {settingsLoaded && freeThreshold > 0 && subtotal >= freeThreshold && (
                <p className="text-[11px] text-green-600 dark:text-green-400">
                  {t('checkout.freeApplied')}
                </p>
              )}
              <div className="flex justify-between font-heading text-[var(--text)] pt-2 border-t border-[var(--border)]">
                <span>{t('checkout.total')}</span>
                <span className="font-bold text-lg">{egp(total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
