import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useCart } from '../context/CartContext.jsx'
import { useTheme } from '../context/ThemeContext.jsx'
import { useLocale } from '../context/LocaleContext.jsx'

function SunIcon({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="4" />
      <path strokeLinecap="round" d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 6.34l-1.41 1.41M19.07 17.66l-1.41 1.41" />
    </svg>
  )
}

function MoonIcon({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 12.79A9 9 0 1111.21 3a7 7 0 009.79 9.79z" />
    </svg>
  )
}

function CartIcon({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="9" cy="21" r="1" /><circle cx="19" cy="21" r="1" />
      <path d="M2.05 2.05h2l2.66 12.42a2 2 0 002 1.58h8.58a2 2 0 001.95-1.57l1.65-7.43H5.12" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function Navbar() {
  const { itemCount, setIsCartOpen } = useCart()
  const { dark, toggle }             = useTheme()
  const { t, lang, toggleLang }       = useLocale()
  const [menuOpen, setMenuOpen]      = useState(false)

  const links = [
    { to: '/',             label: t('nav.home')    },
    { to: '/shop/xpoint',  label: t('nav.xpoint')  },
    { to: '/shop/tictoc',  label: t('nav.tictoc')  },
    { to: '/about',        label: t('nav.about')   },
    { to: '/my-orders',    label: t('nav.orders')  },
  ]

  const linkClass = ({ isActive }) =>
    `relative text-[13px] font-medium tracking-tight transition-colors hover:text-[var(--brand)] py-1 ${
      isActive ? 'text-[var(--brand)]' : 'text-[var(--muted)]'
    }`

  return (
    <header className="sticky top-0 z-40 bg-[var(--bg)]/80 backdrop-blur-lg border-b border-[var(--border)] transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 flex items-center justify-between h-[72px]">

        <Link to="/" className="flex items-center gap-2.5 shrink-0" onClick={() => setMenuOpen(false)}>
          <img src="/logo.jpg" alt={t('brand.tictoc') + ' ' + t('brand.xpoint')} className="h-9 w-9 rounded-lg object-cover" />
          <div className="flex flex-col leading-tight">
            <span className="font-heading font-semibold text-[15px] tracking-tight text-[var(--text)]">{t('brand.tictoc')}</span>
            <span className="font-heading font-medium text-[10px] uppercase tracking-[0.15em] text-[var(--muted)]">{t('brand.xpoint')}</span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {links.map(link => (
            <NavLink key={link.to} to={link.to} end={link.to === '/'} className={linkClass} style={({ isActive }) => ({
              padding: '0.375rem 0.875rem',
              borderRadius: '9999px',
              background: isActive ? 'color-mix(in srgb, var(--brand) 10%, transparent)' : 'transparent',
            })}>
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-0.5">
          <button onClick={toggle}
            className="h-10 w-10 rounded-full flex items-center justify-center text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--border)]/40 transition-colors"
            aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}>
            {dark ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
          </button>

          <button type="button" onClick={toggleLang}
            className="h-10 w-10 rounded-full flex items-center justify-center text-[11px] font-bold text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--border)]/40 transition-colors"
            title={lang === 'en' ? t('lang.toggle') : t('lang.toggleToEn')}>
            {lang === 'en' ? 'AR' : 'EN'}
          </button>

          <button onClick={() => setIsCartOpen(true)}
            className="relative h-10 w-10 rounded-full flex items-center justify-center text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--border)]/40 transition-colors"
            aria-label={t('cart.bag')}>
            <CartIcon className="w-5 h-5" />
            {itemCount > 0 && (
              <span className="absolute top-1.5 right-2 min-w-[18px] h-[18px] bg-[var(--brand)] text-white text-[10px] font-semibold rounded-full flex items-center justify-center px-1">
                {itemCount}
              </span>
            )}
          </button>

          <button className="md:hidden h-10 w-10 rounded-full flex items-center justify-center text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--border)]/40 transition-colors"
            onClick={() => setMenuOpen(v => !v)} aria-label="Toggle menu" aria-expanded={menuOpen}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {menuOpen
                ? <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" strokeLinejoin="round" />
                : <path d="M3 6h18M3 12h18M3 18h18" strokeLinecap="round" strokeLinejoin="round" />}
            </svg>
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav className="md:hidden border-t border-[var(--border)] bg-[var(--surface)] px-5 pb-6 pt-3 flex flex-col gap-1">
          {links.map(link => (
            <NavLink key={link.to} to={link.to} end={link.to === '/'} className={({ isActive }) => `
              px-4 py-3 rounded-xl text-[15px] font-medium transition-colors
              ${isActive ? 'bg-[var(--brand-dim)] text-[var(--brand)]' : 'text-[var(--text)] hover:bg-[var(--muted)]/5'}
            `} onClick={() => setMenuOpen(false)}>
              {link.label}
            </NavLink>
          ))}
          <button onClick={() => { toggleLang(); setMenuOpen(false) }}
            className="mt-2 px-4 py-3 rounded-xl text-[15px] font-medium text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--muted)]/5 transition-colors text-left">
            {lang === 'en' ? '🇪🇬 العربية' : '🇬🇧 English'}
          </button>
        </nav>
      )}
    </header>
  )
}