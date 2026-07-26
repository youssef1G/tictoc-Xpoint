import { useState, useEffect, useRef, useCallback } from 'react'
import { useLocale } from '../context/LocaleContext.jsx'

export default function ProductGallery({ images = [], image, name }) {
  const { t } = useLocale()
  const gallery = images && images.length > 0 ? images : (image ? [image] : [])
  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)
  const [containerWidth, setContainerWidth] = useState(0)
  const [dragX, setDragX] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const containerRef = useRef(null)
  const touchStartRef = useRef(null)
  const intervalRef = useRef(null)
  const activeRef = useRef(0)

  const go = useCallback((idx) => {
    if (idx === activeRef.current) return
    activeRef.current = idx
    setActive(idx)
  }, [])

  const next = useCallback(() => go((activeRef.current + 1) % gallery.length), [gallery.length, go])
  const prev = useCallback(() => go((activeRef.current - 1 + gallery.length) % gallery.length), [gallery.length, go])

  useEffect(() => {
    if (gallery.length <= 1 || paused) return
    intervalRef.current = setInterval(next, 4000)
    return () => clearInterval(intervalRef.current)
  }, [gallery.length, paused, next])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const w = el.offsetWidth
    if (w > 0) setContainerWidth(w)
    const observer = new ResizeObserver(entries => {
      setContainerWidth(entries[0].contentRect.width)
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const handleDragStart = useCallback((clientX) => {
    touchStartRef.current = clientX
    setIsDragging(true)
    setPaused(true)
  }, [])

  const handleDragMove = useCallback((clientX) => {
    if (!isDragging || gallery.length <= 1) return
    setDragX(clientX - touchStartRef.current)
  }, [isDragging, gallery.length])

  const handleDragEnd = useCallback(() => {
    if (!isDragging || gallery.length <= 1) return
    const w = containerWidth || containerRef.current?.offsetWidth || 300
    if (dragX > w * 0.25) {
      prev()
    } else if (dragX < -w * 0.25) {
      next()
    }
    setIsDragging(false)
    setDragX(0)
  }, [isDragging, gallery.length, containerWidth, dragX, prev, next])

  const handleTouchStart = useCallback((e) => handleDragStart(e.touches[0].clientX), [handleDragStart])
  const handleTouchMove = useCallback((e) => handleDragMove(e.touches[0].clientX), [handleDragMove])
  const handleTouchEnd = useCallback(() => handleDragEnd(), [handleDragEnd])
  const handleMouseDown = useCallback((e) => { if (e.button === 0) handleDragStart(e.clientX) }, [handleDragStart])
  const handleMouseMove = useCallback((e) => { if (isDragging) handleDragMove(e.clientX) }, [handleDragMove, isDragging])
  const handleMouseUp = useCallback(() => handleDragEnd(), [handleDragEnd])

  if (gallery.length === 0) return <div className="aspect-square rounded-2xl bg-[var(--muted)]/5 flex items-center justify-center text-xs text-[var(--muted)]">{t('gallery.noImage')}</div>

  return (
    <div className="w-full select-none" onMouseEnter={() => setPaused(true)} onMouseLeave={() => { setPaused(false); if (isDragging) handleDragEnd() }}>
      <div className="aspect-square rounded-2xl border border-[var(--border)] bg-[var(--muted)]/5 mb-3 relative group overflow-hidden"
        ref={containerRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        {containerWidth > 0 && (
          <div className="absolute inset-0 rounded-2xl overflow-hidden">
            <div dir="ltr" style={{
              display: 'flex',
              height: '100%',
              transform: `translateX(${-active * containerWidth + dragX}px)`,
              transition: isDragging ? 'none' : 'transform 0.4s cubic-bezier(0.25, 0.1, 0.25, 1)',
            }}>
              {gallery.map((url, idx) => (
                <div key={idx} style={{ minWidth: containerWidth, flexShrink: 0 }} className="h-full">
                  <img src={url} alt={`${name} ${idx + 1}`} className="w-full h-full object-cover pointer-events-none" />
                </div>
              ))}
            </div>
          </div>
        )}
        {containerWidth === 0 && (
          <div className="absolute inset-0 rounded-2xl overflow-hidden">
            <img src={gallery[active]} alt={name} className="w-full h-full object-cover" />
          </div>
        )}
        {gallery.length > 1 && (
          <>
            <button onClick={prev}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm flex items-center justify-center text-[var(--text)] opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white dark:hover:bg-gray-900 shadow-sm z-10">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
            </button>
            <button onClick={next}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm flex items-center justify-center text-[var(--text)] opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white dark:hover:bg-gray-900 shadow-sm z-10">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6" /></svg>
            </button>
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
              {gallery.map((_, idx) => (
                <button key={idx} onClick={() => go(idx)}
                  className={`w-1.5 h-1.5 rounded-full transition-all ${active === idx ? 'bg-white w-3' : 'bg-white/50 hover:bg-white/70'}`} />
              ))}
            </div>
          </>
        )}
      </div>
      {gallery.length > 1 && (
        <div className="flex gap-2 overflow-x-auto max-w-full pb-1">
          {gallery.map((url, idx) => (
            <button key={url + idx} onClick={() => go(idx)}
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
