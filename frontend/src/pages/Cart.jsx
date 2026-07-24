import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext.jsx'
import { useLocale } from '../context/LocaleContext.jsx'
import Seo from '../components/Seo.jsx'

export default function Cart() {
  const { t } = useLocale()
  const { items, updateQuantity, removeFromCart, subtotal } = useCart()
  const egp = (amount) => t('currency.egp', { amount: Number(amount).toFixed(0) })

  if (items.length === 0) {
    return (
      <>
        <Seo title={t('seo.title.cart')} description={t('seo.desc.cart')} />
        <div className="max-w-xl mx-auto px-5 py-24 text-center">
        <div className="w-16 h-16 rounded-full bg-[var(--brand-dim)] flex items-center justify-center mx-auto mb-5">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-[var(--brand)]">
            <circle cx="9" cy="21" r="1" /><circle cx="19" cy="21" r="1" />
            <path d="M2.05 2.05h2l2.66 12.42a2 2 0 002 1.58h8.58a2 2 0 001.95-1.57l1.65-7.43H5.12" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h1 className="text-heading-lg text-[var(--text)] mb-2">{t('cart.empty')}</h1>
        <p className="text-sm text-[var(--muted)] mb-6">{t('cart.emptyHint2')}</p>
        <Link to="/shop" className="btn-primary">
          {t('cart.shopNow')}
        </Link>
      </div>
    </>
    )
  }

  return (
    <>
      <Seo title={t('seo.title.cart')} description={t('seo.desc.cart')} />
      <div className="max-w-3xl mx-auto px-5 sm:px-8 py-12 sm:py-16">
      <h1 className="text-display text-[var(--text)] mb-8">{t('cart.title')}</h1>

      <ul className="space-y-6">
        {items.map((item) => (
          <li key={item.id} className="flex gap-5 border-b border-[var(--border)] pb-6">
            <img
              src={item.images?.[0] || item.image}
              alt={item.name}
              className="h-24 w-24 rounded-2xl object-cover bg-[var(--muted)]/5 shrink-0"
            />
            <div className="flex-1 min-w-0">
              <p className="text-[15px] font-semibold text-[var(--text)]">{item.name}</p>
              <p className="text-sm font-medium text-[var(--text)] mt-0.5">
                {egp(item.price)}
              </p>
              <div className="mt-3 flex items-center gap-4">
                <div className="flex items-center rounded-full border border-[var(--border)]">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="h-9 w-9 flex items-center justify-center text-[var(--text)] hover:bg-[var(--muted)]/10 rounded-l-full transition-colors"
                    aria-label={t('cart.decrease', { name: item.name })}
                  >−</button>
                  <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    disabled={item.stock !== null && item.stock !== undefined && item.quantity >= item.stock}
                    className="h-9 w-9 flex items-center justify-center text-[var(--text)] hover:bg-[var(--muted)]/10 rounded-r-full transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    aria-label={t('cart.increase', { name: item.name })}
                  >+</button>
                </div>
                <button
                  onClick={() => removeFromCart(item.id)}
                  className="text-xs font-medium text-[var(--muted)] hover:text-[var(--brand)] transition-colors">
                  {t('cart.remove')}
                </button>
              </div>
            </div>
            <p className="text-[15px] font-semibold text-[var(--text)] whitespace-nowrap">
              {egp(item.price * item.quantity)}
            </p>
          </li>
        ))}
      </ul>

      <div className="mt-8 flex items-center justify-between font-heading text-lg font-semibold">
        <span className="text-[var(--text)]">{t('cart.subtotal')}</span>
        <span className="text-[var(--text)]">{egp(subtotal)}</span>
      </div>
      <p className="text-[11px] text-[var(--muted)] mt-1">
        {t('cart.shippingCalculated')}
      </p>

      <Link to="/checkout" className="btn-primary w-full py-3.5 mt-6 text-sm">
        {t('cart.proceedToCheckout')}
      </Link>

      <Link to="/shop" className="block text-center mt-4 text-sm font-medium text-[var(--brand)] hover:underline">
        {t('cart.continueShopping')}
      </Link>
    </div>
    </>
  )
}