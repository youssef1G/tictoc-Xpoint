import { Link } from 'react-router-dom'
import { useLocale } from '../context/LocaleContext.jsx'

export default function Footer() {
  const { t } = useLocale()
  return (
    <footer className="border-t border-[var(--border)] bg-[var(--surface)] mt-16">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 pt-10 sm:pt-12 pb-6">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">

          <div className="lg:col-span-1">
            <div className="flex items-center gap-2.5 mb-3">
              <img src="/logo.jpg" alt={t('brand.tictoc') + ' ' + t('brand.xpoint')} className="h-8 w-8 rounded-lg object-cover" />
              <div className="flex flex-col leading-tight">
                <span className="font-heading font-semibold text-[15px] tracking-tight text-[var(--text)]">{t('brand.tictoc')}</span>
                <span className="font-heading font-medium text-[9px] uppercase tracking-[0.15em] text-[var(--muted)]">{t('brand.xpoint')}</span>
              </div>
            </div>
            <p className="text-[13px] text-[var(--muted)] leading-relaxed max-w-xs">
              {t('footer.tagline')}
            </p>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--text)] mb-3">{t('footer.shop')}</h4>
            <ul className="space-y-2">
              <li><Link to="/shop" className="text-[13px] text-[var(--muted)] hover:text-[var(--brand)] transition-colors">{t('footer.allStores')}</Link></li>
              <li><Link to="/shop/xpoint" className="text-[13px] text-[var(--muted)] hover:text-[var(--brand)] transition-colors">{t('footer.xpoint')}</Link></li>
              <li><Link to="/shop/tictoc" className="text-[13px] text-[var(--muted)] hover:text-[var(--brand)] transition-colors">{t('footer.tictoc')}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--text)] mb-3">{t('footer.help')}</h4>
            <ul className="space-y-2">
              <li><Link to="/about" className="text-[13px] text-[var(--muted)] hover:text-[var(--brand)] transition-colors">{t('footer.aboutUs')}</Link></li>
              <li><Link to="/contact" className="text-[13px] text-[var(--muted)] hover:text-[var(--brand)] transition-colors">{t('footer.contact')}</Link></li>
              <li><Link to="/my-orders" className="text-[13px] text-[var(--muted)] hover:text-[var(--brand)] transition-colors">{t('footer.trackOrder')}</Link></li>
              <li><Link to="/my-orders" className="text-[13px] text-[var(--muted)] hover:text-[var(--brand)] transition-colors">{t('footer.returns')}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--text)] mb-3">{t('footer.connect')}</h4>
            <ul className="space-y-2">
              <li>
                <a href="https://wa.me/201554219464" target="_blank" rel="noopener noreferrer" className="text-[13px] text-[var(--muted)] hover:text-[var(--brand)] transition-colors">
                  WhatsApp
                </a>
              </li>
              <li>
                <a href="https://www.instagram.com/tictocxpoint" target="_blank" rel="noopener noreferrer" className="text-[13px] text-[var(--muted)] hover:text-[var(--brand)] transition-colors">
                  Instagram
                </a>
              </li>
              <li>
                <a href="https://www.facebook.com/tictocxpoint" target="_blank" rel="noopener noreferrer" className="text-[13px] text-[var(--muted)] hover:text-[var(--brand)] transition-colors">
                  Facebook
                </a>
              </li>
              <li>
                <a href="https://www.tiktok.com/@tictocxpoint" target="_blank" rel="noopener noreferrer" className="text-[13px] text-[var(--muted)] hover:text-[var(--brand)] transition-colors">
                  TikTok
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-[var(--border)] py-4 text-center text-[12px] text-[var(--muted)] space-y-1">
        <p>{t('footer.copyright', { year: new Date().getFullYear() })}</p>
        <p>
          {t('footer.developedBy')}{' '}
          <a
            href="https://www.linkedin.com/in/yousssefgamal"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-[var(--text)] hover:text-[var(--brand)] transition-colors"
          >
            Youssef Gamal
          </a>
        </p>
      </div>
    </footer>
  )
}