import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="max-w-lg mx-auto px-5 py-24 text-center">
      <div className="w-16 h-16 rounded-full bg-[var(--brand-dim)] flex items-center justify-center mx-auto mb-5">
        <span className="text-xl font-bold text-[var(--brand)]">404</span>
      </div>
      <h1 className="text-display text-[var(--text)] mb-2">Page not found</h1>
      <p className="text-sm text-[var(--muted)] mb-8">This page doesn't exist. Let's get you back on track.</p>
      <Link to="/" className="btn-primary text-sm">Back to home</Link>
    </div>
  )
}