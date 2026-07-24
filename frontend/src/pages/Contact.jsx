import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { submitComplaint } from '../api.js'
import { useLocale } from '../context/LocaleContext.jsx'
import Seo from '../components/Seo.jsx'

function validate(form, t) {
  const e = {}
  if (form.name.trim().length < 2) e.name = t('contact.nameError')
  if (!/^(010|011|012|015)\d{8}$/.test(form.phone.replace(/\s/g, ''))) e.phone = t('contact.phoneError')
  if (form.message.trim().length < 10) e.message = t('contact.messageError')
  return e
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

export default function Contact() {
  const { t } = useLocale()
  const [form, setForm] = useState({ name: '', phone: '', message: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [serverError, setServerError] = useState('')

  const phoneRef = useRef(null)
  const messageRef = useRef(null)

  const set = f => e => {
    setForm(p => ({ ...p, [f]: e.target.value }))
    if (errors[f]) setErrors(p => ({ ...p, [f]: '' }))
  }

  const next = (e, ref) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      ref.current.focus()
    }
  }

  const send = e => {
    if (e.key === 'Enter' && e.ctrlKey) {
      e.preventDefault()
      e.currentTarget.form.requestSubmit()
    }
  }

  const inputCls = f =>
    `w-full rounded-xl border px-4 py-3 text-sm font-medium bg-[var(--surface)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--brand)] focus:border-[var(--brand)] transition ${
      errors[f] ? 'border-red-400' : 'border-[var(--border)]'
    }`

  async function handleSubmit(e) {
    e.preventDefault()
    setServerError('')
    const errs = validate(form, t)
    if (Object.keys(errs).length) return setErrors(errs)
    setLoading(true)
    try {
      await submitComplaint(form)
      setSuccess(true)
    } catch (err) {
      setServerError(err.message || t('contact.genericError'))
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="max-w-lg mx-auto px-5 py-24 text-center">
        <div className="w-16 h-16 rounded-full bg-[var(--brand-dim)] flex items-center justify-center mx-auto mb-5">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[var(--brand)]">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" strokeLinecap="round" strokeLinejoin="round"/>
            <polyline points="22 4 12 14.01 9 11.01" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <h2 className="text-heading-lg text-[var(--text)] mb-2">{t('contact.received')}</h2>
        <p className="text-sm text-[var(--muted)] mb-8">{t('contact.receivedDesc')}</p>
        <Link to="/" className="btn-primary text-sm">{t('contact.backHome')}</Link>
      </div>
    )
  }

  return (
    <>
      <Seo title={t('seo.title.contact')} description={t('seo.desc.contact')} />
      <div className="max-w-xl mx-auto px-5 sm:px-8 py-14 sm:py-20">
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--brand-dim)] border border-[var(--brand)]/10 mb-4">
          <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--brand)]">{t('contact.badge')}</span>
        </div>
        <h1 className="text-display text-[var(--text)] mb-2">{t('contact.title')}</h1>
        <p className="text-sm text-[var(--muted)]">{t('contact.desc')}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <Field label={t('contact.fullName')} error={errors.name}>
          <input value={form.name} onChange={set('name')} onKeyDown={e => next(e, phoneRef)}
            placeholder={t('contact.namePlaceholder')} className={inputCls('name')} />
        </Field>
        <Field label={t('contact.phone')} error={errors.phone}>
          <input ref={phoneRef} value={form.phone} onChange={set('phone')} onKeyDown={e => next(e, messageRef)}
            placeholder={t('contact.phonePlaceholder')} className={inputCls('phone')} />
        </Field>
        <Field label={t('contact.message')} error={errors.message}>
          <textarea ref={messageRef} value={form.message} onChange={set('message')} onKeyDown={send}
            rows={5} placeholder={t('contact.messagePlaceholder')} className={inputCls('message')} />
        </Field>
        {serverError && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">{serverError}</p>
        )}
        <button type="submit" disabled={loading}
          className="btn-primary w-full py-3.5 text-sm disabled:opacity-50">
          {loading ? t('contact.sending') : t('contact.send')}
        </button>
      </form>
    </div>
    </>
  )
}