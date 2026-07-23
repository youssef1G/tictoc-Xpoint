import { useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useCart } from '../context/CartContext.jsx'

export default function CheckoutSuccess() {
  const [params] = useSearchParams()
  const { clearCart } = useCart()
  const orderId = params.get('orderId')

  useEffect(() => { clearCart() }, [])

  return (
    <div className="max-w-lg mx-auto px-5 py-24 text-center">
      <div className="w-16 h-16 rounded-full bg-green-50 dark:bg-green-900/20 border border-green-200 flex items-center justify-center mx-auto mb-5">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" strokeLinecap="round" strokeLinejoin="round"/>
          <polyline points="22 4 12 14.01 9 11.01" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <h1 className="text-display text-[var(--text)] mb-3">Order placed!</h1>
      <p className="text-sm text-[var(--muted)] mb-2">
        Thank you for your order. We'll prepare it and deliver it as soon as possible.
      </p>
      {orderId && (
        <p className="text-xs font-mono text-[var(--muted)] mb-8">Order ID: {orderId}</p>
      )}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        {orderId && (
          <Link to={`/order/${orderId}`} className="btn-primary text-sm">
            Track my order →
          </Link>
        )}
        <Link to="/shop" className="btn-secondary text-sm">
          Continue shopping
        </Link>
      </div>
    </div>
  )
}