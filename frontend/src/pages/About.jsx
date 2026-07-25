import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { useLocale } from '../context/LocaleContext.jsx'
import { fadeUp } from '../lib/animations.js'

export default function About() {
  const { t } = useLocale()
  return (
    <div className="max-w-3xl mx-auto px-5 sm:px-8 py-16 sm:py-24">
      <motion.div className="text-center mb-12" {...fadeUp}>
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--brand-dim)] border border-[var(--brand)]/10 mb-5">
          <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--brand)]">{t('about.badge')}</span>
        </div>
        <h1 className="text-display text-[var(--text)]">{t('about.title')}</h1>
      </motion.div>

      <motion.div className="space-y-5 text-sm text-[var(--muted)] leading-relaxed"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 0.55, ease: [0.25, 0.1, 0.25, 1], delay: 0.1 }}
      >
        <p>{t('about.text1')}</p>
        <p>{t('about.text2')}</p>
        <p>{t('about.text3')}</p>
      </motion.div>

      <motion.div className="mt-12 text-center"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1], delay: 0.25 }}
      >
        <Link to="/shop" className="btn-primary px-8 py-3 text-sm">
          {t('about.exploreCollection')}
        </Link>
      </motion.div>
    </div>
  )
}