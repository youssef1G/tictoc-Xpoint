import { useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { motion } from 'motion/react'
import { useCart } from '../context/CartContext.jsx'
import { useLocale } from '../context/LocaleContext.jsx'
import { scaleIn } from '../lib/animations.js'

export default function CheckoutSuccess() {
  const { t } = useLocale()
  const [params] = useSearchParams()
  const { clearCart } = useCart()
  const orderId = params.get('orderId')

  useEffect(() => { clearCart() }, [])

  return (
    <motion.div className="max-w-lg mx-auto px-5 py-24 text-center" {...scaleIn}>
      <div className="w-16 h-16 rounded-full bg-green-50 dark:bg-green-900/20 border border-green-200 flex items-center justify-center mx-auto mb-5">
        <motion.svg
          width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut', delay: 0.3 }}
        >
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" strokeLinecap="round" strokeLinejoin="round"/>
          <motion.polyline
            points="22 4 12 14.01 9 11.01"
            strokeLinecap="round" strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.4, ease: 'easeOut', delay: 0.7 }}
          />
        </motion.svg>
      </div>
      <h1 className="text-display text-[var(--text)] mb-3">{t('checkoutSuccess.title')}</h1>
      <p className="text-sm text-[var(--muted)] mb-2">
        {t('checkoutSuccess.desc')}
      </p>
      {orderId && (
        <p className="text-xs font-mono text-[var(--muted)] mb-8">{t('checkoutSuccess.orderId', { id: orderId })}</p>
      )}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        {orderId && (
          <Link to={`/order/${orderId}`} className="btn-primary text-sm">
            {t('checkoutSuccess.track')}
          </Link>
        )}
        <Link to="/shop" className="btn-secondary text-sm">
          {t('checkoutSuccess.continue')}
        </Link>
      </div>
    </motion.div>
  )
}