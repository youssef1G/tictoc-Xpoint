import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { useLocale } from '../context/LocaleContext.jsx'
import { scaleIn } from '../lib/animations.js'

export default function CheckoutCancel() {
  const { t } = useLocale()
  return (
    <motion.div className="max-w-lg mx-auto px-5 py-24 text-center" {...scaleIn}>
      <div className="w-16 h-16 rounded-full bg-gray-50 dark:bg-gray-800 border border-[var(--border)] flex items-center justify-center mx-auto mb-5">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[var(--muted)]">
          <circle cx="12" cy="12" r="10" />
          <path d="M15 9l-6 6M9 9l6 6" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <h1 className="text-heading-lg text-[var(--text)] mb-3">{t('checkoutCancel.title')}</h1>
      <p className="text-sm text-[var(--muted)] mb-8">{t('checkoutCancel.desc')}</p>
      <div className="flex gap-3 justify-center">
        <Link to="/cart" className="btn-primary text-sm">{t('checkoutCancel.backToCart')}</Link>
        <Link to="/shop" className="btn-secondary text-sm">{t('checkoutCancel.keepShopping')}</Link>
      </div>
    </motion.div>
  )
}