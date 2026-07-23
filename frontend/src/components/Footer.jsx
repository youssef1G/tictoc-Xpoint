import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="border-t border-[var(--border)] bg-[var(--surface)] mt-16">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 pt-10 sm:pt-12 pb-6">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">

          <div className="lg:col-span-1">
            <div className="flex items-center gap-2.5 mb-3">
              <img src="/logo.jpg" alt="Tic Toc Xpoint" className="h-8 w-8 rounded-lg object-cover" />
              <div className="flex flex-col leading-tight">
                <span className="font-heading font-semibold text-[15px] tracking-tight text-[var(--text)]">Tic Toc</span>
                <span className="font-heading font-medium text-[9px] uppercase tracking-[0.15em] text-[var(--muted)]">Xpoint</span>
              </div>
            </div>
            <p className="text-[13px] text-[var(--muted)] leading-relaxed max-w-xs">
              Premium mobile accessories. Designed to feel as good as they look, built to last.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--text)] mb-3">Shop</h4>
            <ul className="space-y-2">
              <li><Link to="/shop" className="text-[13px] text-[var(--muted)] hover:text-[var(--brand)] transition-colors">All products</Link></li>
              <li><Link to="/shop?category=Phone%20Cases" className="text-[13px] text-[var(--muted)] hover:text-[var(--brand)] transition-colors">Phone cases</Link></li>
              <li><Link to="/shop?category=Chargers" className="text-[13px] text-[var(--muted)] hover:text-[var(--brand)] transition-colors">Chargers</Link></li>
              <li><Link to="/shop?category=Earbuds" className="text-[13px] text-[var(--muted)] hover:text-[var(--brand)] transition-colors">Audio</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--text)] mb-3">Help</h4>
            <ul className="space-y-2">
              <li><Link to="/about" className="text-[13px] text-[var(--muted)] hover:text-[var(--brand)] transition-colors">About us</Link></li>
              <li><Link to="/contact" className="text-[13px] text-[var(--muted)] hover:text-[var(--brand)] transition-colors">Contact</Link></li>
              <li><Link to="/my-orders" className="text-[13px] text-[var(--muted)] hover:text-[var(--brand)] transition-colors">Track order</Link></li>
              <li><Link to="/my-orders" className="text-[13px] text-[var(--muted)] hover:text-[var(--brand)] transition-colors">Returns</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--text)] mb-3">Connect</h4>
            <ul className="space-y-2">
              <li>
                <a href="https://wa.me/201554219464" target="_blank" rel="noopener noreferrer" className="text-[13px] text-[var(--muted)] hover:text-[var(--brand)] transition-colors">
                  WhatsApp
                </a>
              </li>
              <li>
                <a href="#" className="text-[13px] text-[var(--muted)] hover:text-[var(--brand)] transition-colors">
                  Instagram
                </a>
              </li>
              <li>
                <a href="#" target="_blank" rel="noopener noreferrer" className="text-[13px] text-[var(--muted)] hover:text-[var(--brand)] transition-colors">
                  Facebook
                </a>
              </li>
              <li>
                <a href="#" target="_blank" rel="noopener noreferrer" className="text-[13px] text-[var(--muted)] hover:text-[var(--brand)] transition-colors">
                  TikTok
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-[var(--border)] py-4 text-center text-[12px] text-[var(--muted)] space-y-1">
        <p>&copy; {new Date().getFullYear()} Tic Toc Xpoint. All rights reserved.</p>
        <p>
          Developed By{' '}
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