import { useState } from 'react'
import { useLocale } from '../context/LocaleContext.jsx'
export default function ProductGallery({ images = [], image, name }) {
  const { t } = useLocale()
  const gallery = images && images.length > 0 ? images : (image ? [image] : [])
  const [active, setActive] = useState(0)
  if (gallery.length === 0) return <div className="aspect-square rounded-2xl bg-[var(--muted)]/5 flex items-center justify-center text-xs text-[var(--muted)]">{t('gallery.noImage')}</div>
  return (
    <div>
      <div className="aspect-square rounded-2xl overflow-hidden border border-[var(--border)] bg-[var(--muted)]/5 mb-3">
        <img src={gallery[active]} alt={name} className="w-full h-full object-cover transition-opacity duration-200" />
      </div>
      {gallery.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {gallery.map((url, idx) => (
            <button key={url + idx} onClick={() => setActive(idx)}
              className={`shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-colors ${
                active === idx ? 'border-[var(--brand)]' : 'border-[var(--border)] hover:border-[var(--muted)]'
              }`}>
              <img src={url} alt={`${name} ${idx + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}