import { Link } from 'react-router-dom'

export default function About() {
  return (
    <div className="max-w-3xl mx-auto px-5 sm:px-8 py-16 sm:py-24">
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--brand-dim)] border border-[var(--brand)]/10 mb-5">
          <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--brand)]">About</span>
        </div>
        <h1 className="text-display text-[var(--text)]">About Tic Toc Xpoint</h1>
      </div>

      <div className="space-y-5 text-sm text-[var(--muted)] leading-relaxed">
        <p>
          Tic Toc Xpoint started with a simple idea: the right thing finds you at the right time.
          Every piece in our collection is curated with care, designed to be worn, shared, and treasured.
        </p>
        <p>
          We believe in quality over quantity. Each item is chosen for its craftsmanship, its story,
          and the way it makes you feel. From accessories to everyday essentials, everything we offer
          is meant to last.
        </p>
        <p>
          Thank you for being part of the Tic Toc Xpoint story. We're glad you're here.
        </p>
      </div>

      <div className="mt-12 text-center">
        <Link to="/shop" className="btn-primary px-8 py-3 text-sm">
          Explore the collection
        </Link>
      </div>
    </div>
  )
}