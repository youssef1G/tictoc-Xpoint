import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { submitComplaint } from '../api.js'

function validate(form) {
  const e = {}
  if (form.name.trim().length < 2) e.name = 'Please enter your full name'
  if (!/^(010|011|012|015)\d{8}$/.test(form.phone.replace(/\s/g, ''))) e.phone = 'Enter a valid Egyptian number'
  if (form.message.trim().length < 10) e.message = 'Please describe your issue (min 10 characters)'
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
    const errs = validate(form)
    if (Object.keys(errs).length) return setErrors(errs)
    setLoading(true)
    try {
      await submitComplaint(form)
      setSuccess(true)
    } catch (err) {
      setServerError(err.message || 'Something went wrong.')
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
        <h2 className="text-heading-lg text-[var(--text)] mb-2">Message received</h2>
        <p className="text-sm text-[var(--muted)] mb-8">Thank you for reaching out. We'll get back to you soon.</p>
        <Link to="/" className="btn-primary text-sm">Back to home</Link>
      </div>
    )
  }

  return (
    <div className="max-w-xl mx-auto px-5 sm:px-8 py-14 sm:py-20">
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--brand-dim)] border border-[var(--brand)]/10 mb-4">
          <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--brand)]">Support</span>
        </div>
        <h1 className="text-display text-[var(--text)] mb-2">Contact us</h1>
        <p className="text-sm text-[var(--muted)]">Have a complaint or need help? We're here for you.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <Field label="Full name" error={errors.name}>
          <input value={form.name} onChange={set('name')} onKeyDown={e => next(e, phoneRef)}
            placeholder="Mohamed Ahmed" className={inputCls('name')} />
        </Field>
        <Field label="Phone number" error={errors.phone}>
          <input ref={phoneRef} value={form.phone} onChange={set('phone')} onKeyDown={e => next(e, messageRef)}
            placeholder="01x xxxx xxxx" className={inputCls('phone')} />
        </Field>
        <Field label="Your message" error={errors.message}>
          <textarea ref={messageRef} value={form.message} onChange={set('message')} onKeyDown={send}
            rows={5} placeholder="Describe your issue in detail..." className={inputCls('message')} />
        </Field>
        {serverError && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">{serverError}</p>
        )}
        <button type="submit" disabled={loading}
          className="btn-primary w-full py-3.5 text-sm disabled:opacity-50">
          {loading ? 'Sending...' : 'Send message'}
        </button>
      </form>
    </div>
  )
}