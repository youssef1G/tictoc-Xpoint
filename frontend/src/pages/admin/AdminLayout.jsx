import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { useLocale } from '../../context/LocaleContext.jsx'
import { useState, useEffect } from 'react'

const NAV_KEYS = [
  { to: '/admin', end: true, tk: 'admin.sidebar.dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { to: '/admin/products', tk: 'admin.sidebar.products', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
  { to: '/admin/orders', tk: 'admin.sidebar.orders', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01' },
  { to: '/admin/support', tk: 'admin.sidebar.support', icon: 'M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z' },
  { to: '/admin/analytics', tk: 'admin.sidebar.analytics', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
  { to: '/admin/customers', tk: 'admin.sidebar.customers', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z' },
  { to: '/admin/manage', tk: 'admin.sidebar.admins', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z' },
  { to: '/admin/shipping', tk: 'admin.sidebar.shipping', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z' },
]

function NavIcon({ path }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d={path} />
    </svg>
  )
}

export default function AdminLayout() {
  const { t, toggleLang, lang } = useLocale()
  const { logout } = useAuth()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024)

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)')
    const handler = e => setIsDesktop(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/admin-access', { replace: true })
  }

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
      isActive
        ? 'bg-[var(--brand)]/10 text-[var(--brand)]'
        : 'text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--muted)]/5'
    }`

  return (
    <div className="min-h-screen flex">
      <div className="fixed inset-y-0 z-40 w-60 bg-[var(--surface)] flex flex-col transition-transform duration-200"
        style={{
          [lang === 'ar' ? 'right' : 'left']: 0,
          [lang === 'ar' ? 'left' : 'right']: 'auto',
          borderRight: lang === 'ar' ? undefined : '1px solid var(--border)',
          borderLeft: lang === 'ar' ? '1px solid var(--border)' : undefined,
          transform: sidebarOpen || isDesktop
            ? 'translateX(0)'
            : `translateX(${lang === 'ar' ? '100%' : '-100%'})`,
        }}>
        <div className="flex items-center gap-3 px-5 h-16 border-b border-[var(--border)] shrink-0">
          <img src="/logo.jpg" alt={t('brand.tictoc') + ' ' + t('brand.xpoint')} className="h-8 w-8 rounded-lg object-cover" />
          <div>
            <span className="font-heading text-sm font-bold text-[var(--text)]">{t('brand.tictoc')}</span>
            <span className="font-heading text-sm font-bold text-[var(--brand)]"> {t('brand.xpoint')}</span>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {NAV_KEYS.map(item => (
            <NavLink key={item.to + (item.end ? '-end' : '')} to={item.to} end={item.end} className={linkClass} onClick={() => setSidebarOpen(false)}>
              <NavIcon path={item.icon} />
              {t(item.tk)}
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-[var(--border)] space-y-2">
          <button onClick={() => { setSidebarOpen(false); navigate('/') }}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--muted)]/5 transition-all w-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"
              style={{ transform: lang === 'ar' ? 'scaleX(-1)' : 'none' }}>
              <path d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            {t('admin.storefront')}
          </button>
          <div className="flex items-center gap-2">
            <button onClick={handleLogout}
              className="flex-1 flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[var(--muted)] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"
                style={{ transform: lang === 'ar' ? 'scaleX(-1)' : 'none' }}>
                <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              {t('admin.logout')}
            </button>
            <button onClick={toggleLang}
              className="px-3 py-2.5 rounded-xl text-sm font-bold text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--muted)]/5 transition-all"
              title={lang === 'en' ? t('lang.toggle') : t('lang.toggleToEn')}>
              {lang === 'en' ? 'ع' : 'EN'}
            </button>
          </div>
        </div>
      </div>

      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-black/30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <div className="flex-1 min-w-0" style={{ [lang === 'ar' ? 'paddingRight' : 'paddingLeft']: '15rem' }}>
        <header className="sticky top-0 z-20 bg-[var(--bg)]/80 backdrop-blur-md border-b border-[var(--border)]">
          <div className="flex items-center justify-between h-16 px-5">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-xl hover:bg-[var(--muted)]/5 text-[var(--muted)]" style={{ [lang === 'ar' ? 'marginRight' : 'marginLeft']: '-0.5rem' }}>
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </header>

        <main className="p-5 sm:p-8 max-w-6xl">
          <Outlet />
        </main>
      </div>
    </div>
  )
}