import { useState, useRef, useEffect } from 'react'
export default function CustomSelect({ value, onChange, options, placeholder = 'Select...' }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const selected = options.find(o => o.value === value)
  useEffect(() => {
    function handleClick(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    function handleKey(e) { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', handleClick)
    document.addEventListener('keydown', handleKey)
    return () => { document.removeEventListener('mousedown', handleClick); document.removeEventListener('keydown', handleKey) }
  }, [])
  return (
    <div ref={ref} className="relative">
      <button type="button" onClick={() => setOpen(o => !o)}
        aria-haspopup="listbox" aria-expanded={open}
        className="w-full flex items-center justify-between gap-2 rounded-xl border border-[var(--border)] px-4 py-3 text-sm bg-[var(--surface)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--brand)]">
        <span className={selected ? 'text-[var(--text)]' : 'text-[var(--muted)]'}>{selected?.label || placeholder}</span>
        <svg className={`w-4 h-4 text-[var(--muted)] transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      {open && (
        <ul className="absolute z-50 mt-1 w-full bg-[var(--surface)] border border-[var(--border)] rounded-xl shadow-lg overflow-hidden" role="listbox">
          {options.map(o => (
            <li key={o.value}>
              <button type="button" role="option" aria-selected={o.value === value} onClick={() => { onChange(o.value); setOpen(false) }}
                className={`w-full text-left px-4 py-3 text-sm transition-colors ${
                  o.value === value ? 'bg-brand-100 text-brand-700 dark:bg-brand-900/20 dark:text-brand-400 font-medium' : 'text-[var(--text)] hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}>
                {o.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}