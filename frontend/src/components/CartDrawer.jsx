import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext.jsx'
import { useLocale } from '../context/LocaleContext.jsx'

export default function CartDrawer() {
  const { t, lang } = useLocale()
  const { items, isCartOpen, setIsCartOpen, updateQuantity, removeFromCart, subtotal } = useCart()

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/50 z-50 transition-opacity duration-300 backdrop-blur-sm ${
          isCartOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsCartOpen(false)}
        aria-hidden="true"
      />

      <aside
        className={`fixed top-0 h-full w-full sm:w-[420px] bg-[var(--surface)] z-[51] shadow-xl transition-transform duration-300 flex flex-col ${
          isCartOpen ? '' : 'invisible pointer-events-none'
        }`}
        style={{
          [lang === 'ar' ? 'left' : 'right']: 0,
          [lang === 'ar' ? 'right' : 'left']: 'auto',
          transform: isCartOpen ? 'translateX(0)' : `translateX(${lang === 'ar' ? '-100%' : '100%'})`,
        }}
        aria-label={t('cart.bag')}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]">
          <h2 className="font-heading text-lg font-semibold text-[var(--text)]">{t('cart.title')}</h2>
          <button
            onClick={() => setIsCartOpen(false)}
            className="p-2 rounded-full hover:bg-[var(--border)]/40 transition-colors text-[var(--muted)]"
            aria-label={t('cart.close')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center gap-3">
              <div className="w-16 h-16 rounded-full bg-[var(--brand-dim)] flex items-center justify-center mb-2">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-[var(--brand)]">
                  <circle cx="9" cy="21" r="1" /><circle cx="19" cy="21" r="1" />
                  <path d="M2.05 2.05h2l2.66 12.42a2 2 0 002 1.58h8.58a2 2 0 001.95-1.57l1.65-7.43H5.12" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <p className="font-heading font-semibold text-[var(--text)]">{t('cart.empty')}</p>
              <p className="text-sm text-[var(--muted)]">{t('cart.emptyHint')}</p>
              <Link to="/shop" onClick={() => setIsCartOpen(false)}
                className="btn-primary mt-2 text-sm">
                {t('cart.browse')}
              </Link>
            </div>
          ) : (
            <ul className="space-y-5">
              {items.map((item) => (
                <li key={item.id} className="flex gap-4">
                  <img src={item.images?.[0] || item.image} alt={item.name}
                    className="h-20 w-20 rounded-xl object-cover bg-[var(--muted)]/5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[var(--text)] truncate">{item.name}</p>
                    <p className="text-sm font-medium text-[var(--text)] mt-0.5">EGP {Number(item.price).toFixed(0)}</p>
                    <div className="mt-2.5 flex items-center gap-2">
                      <div className="flex items-center rounded-full border border-[var(--border)]">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="h-8 w-8 flex items-center justify-center text-[var(--text)] hover:bg-[var(--muted)]/10 rounded-l-full transition-colors text-sm"
                          aria-label={t('cart.decrease', { name: item.name })}
                        >−</button>
                        <span className="w-8 text-center text-xs font-medium">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          disabled={item.stock !== null && item.stock !== undefined && item.quantity >= item.stock}
                          className="h-8 w-8 flex items-center justify-center text-[var(--text)] hover:bg-[var(--muted)]/10 rounded-r-full transition-colors text-sm disabled:opacity-30 disabled:cursor-not-allowed"
                          aria-label={t('cart.increase', { name: item.name })}
                        >+</button>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-[11px] font-medium text-[var(--muted)] hover:text-[var(--brand)] transition-colors ml-auto">
                        {t('cart.remove')}
                      </button>
                    </div>
                  </div>
                  <p className="text-sm font-semibold text-[var(--text)] whitespace-nowrap">
                    EGP {Number(item.price * item.quantity).toFixed(0)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-[var(--border)] px-5 py-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-[var(--muted)]">{t('cart.subtotal')}</span>
              <span className="font-heading text-lg font-semibold text-[var(--text)]">
                EGP {Number(subtotal).toFixed(0)}
              </span>
            </div>
            <p className="text-[11px] text-[var(--muted)]">{t('cart.shippingCalculated')}</p>
            <Link
              to="/cart"
              onClick={() => setIsCartOpen(false)}
              className="btn-primary w-full py-3 text-sm">
              {t('cart.viewCart')}
            </Link>
          </div>
        )}
      </aside>
    </>
  )
}