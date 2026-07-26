import { useEffect, useRef, useState, useCallback } from 'react'
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import { useLocale } from '../context/LocaleContext.jsx'
import { LoaderCircle, MapPin, Search, X } from 'lucide-react'
import 'leaflet/dist/leaflet.css'

const NOMINATIM_SEARCH = 'https://nominatim.openstreetmap.org/search'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

function MapController({ position, searchResult }) {
  const map = useMap()
  const prev = useRef(null)

  useEffect(() => {
    if (searchResult && searchResult !== prev.current) {
      prev.current = searchResult
      const bounds = L.latLngBounds(
        L.latLng(searchResult.boundingbox[0], searchResult.boundingbox[2]),
        L.latLng(searchResult.boundingbox[1], searchResult.boundingbox[3])
      )
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 16 })
    }
  }, [searchResult, map])

  return null
}

function ClickMarker({ position, onMove }) {
  useMapEvents({
    click(e) { onMove(e.latlng) },
  })
  return position ? <Marker position={position} draggable={true} eventHandlers={{ dragend: (e) => onMove(e.target.getLatLng()) }} /> : null
}

function SearchControl({ onSelect, lang }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [open, setOpen] = useState(false)
  const inputRef = useRef(null)
  const timerRef = useRef(null)

  const handleSearch = useCallback(async (q) => {
    if (!q.trim()) { setResults([]); return }
    setSearching(true)
    try {
      const params = new URLSearchParams({ format: 'json', q, limit: 5, 'accept-language': lang })
      const res = await fetch(`${NOMINATIM_SEARCH}?${params}`, {
        headers: { 'User-Agent': 'TicTocXpoint/1.0' },
      })
      if (!res.ok) throw new Error()
      const data = await res.json()
      setResults(data || [])
      setOpen(true)
    } catch { setResults([]) }
    finally { setSearching(false) }
  }, [lang])

  const handleChange = useCallback((e) => {
    const v = e.target.value
    setQuery(v)
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => handleSearch(v), 400)
  }, [handleSearch])

  const handleSelect = useCallback((result) => {
    setQuery(result.display_name)
    setOpen(false)
    setResults([])
    onSelect(result)
  }, [onSelect])

  const handleClear = useCallback(() => {
    setQuery('')
    setResults([])
    setOpen(false)
    inputRef.current?.focus()
  }, [])

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') { setOpen(false); inputRef.current?.blur() }
  }, [])

  return (
    <div className="leaflet-top" style={{ marginTop: 10, left: '50%', transform: 'translateX(-50%)', zIndex: 1000, pointerEvents: 'none' }}>
      <div style={{ width: 'min(90vw, 320px)', pointerEvents: 'auto' }}>
        <div className="flex items-center gap-1 bg-white rounded-xl shadow-md border border-gray-200 px-3 py-2 text-gray-900">
          {searching ? <LoaderCircle className="w-4 h-4 animate-spin shrink-0 text-gray-400" /> : <Search className="w-4 h-4 shrink-0 text-gray-400" />}
          <input ref={inputRef} type="text" value={query} onChange={handleChange} onKeyDown={handleKeyDown}
            placeholder={lang === 'ar' ? 'ابحث عن مكان…' : 'Search for a place…'}
            className="flex-1 text-sm outline-none bg-transparent min-w-0 text-gray-900 placeholder-gray-400"
            onFocus={() => results.length > 0 && setOpen(true)}
          />
          {query && (
            <button type="button" onClick={handleClear} className="shrink-0">
              <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
            </button>
          )}
        </div>
        {open && results.length > 0 && (
          <ul className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-lg border border-gray-200 max-h-60 overflow-y-auto z-50 text-gray-900 pointer-events-auto">
            {results.map((r, idx) => (
              <li key={idx}>
                <button type="button" onClick={() => handleSelect(r)}
                  className="w-full text-left text-xs px-3 py-2.5 hover:bg-gray-50 border-b border-gray-100 last:border-0 transition-colors flex items-start gap-1.5">
                  <MapPin className="w-3 h-3 shrink-0 text-gray-400 mt-0.5" />
                  <span>{r.display_name}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

function LocateButton({ locating, onLocate }) {
  const { t } = useLocale()
  return (
    <div className="leaflet-top leaflet-left" style={{ marginTop: 10, marginLeft: 10 }}>
      <button type="button" onClick={onLocate} disabled={locating}
        className="leaflet-control text-xs font-semibold flex items-center gap-1.5 disabled:opacity-50"
        style={{
          background: 'white', border: '2px solid rgba(0,0,0,0.15)',
          borderRadius: 6, padding: '8px 10px', cursor: 'pointer',
          boxShadow: '0 1px 5px rgba(0,0,0,0.15)',
        }}>
        {locating ? <LoaderCircle className="w-3.5 h-3.5 animate-spin" /> : <MapPin className="w-3.5 h-3.5" />}
        <span className="hidden sm:inline">{locating ? '…' : t('checkout.locateMe')}</span>
      </button>
    </div>
  )
}

export default function LocationPicker({ value, onChange }) {
  const { t, lang } = useLocale()
  const [locating, setLocating] = useState(false)
  const [locError, setLocError] = useState('')
  const [searchResult, setSearchResult] = useState(null)

  const defaultCenter = { lat: 26.8206, lng: 30.8025 }
  const center = value || defaultCenter

  const handleMapClick = useCallback((latlng) => {
    onChange({ lat: latlng.lat, lng: latlng.lng })
    setLocError('')
  }, [onChange])

  const handleSearchSelect = useCallback((result) => {
    onChange({ lat: parseFloat(result.lat), lng: parseFloat(result.lon) })
    setSearchResult(result)
    setLocError('')
  }, [onChange])

  const handleLocate = useCallback(() => {
    if (!navigator.geolocation) { setLocError(t('checkout.locationUnsupported')); return }
    setLocating(true)
    setLocError('')
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        onChange({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        setSearchResult(null)
        setLocating(false)
      },
      () => { setLocError(t('checkout.locationError')); setLocating(false) },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }, [onChange, t])

  return (
    <div>
      <div className="rounded-2xl overflow-hidden border border-[var(--border)]" style={{ height: 320 }}>
        <MapContainer center={center} zoom={value ? 15 : 6} scrollWheelZoom={true}
          style={{ height: '100%', width: '100%' }}
          zoomControl={false}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <ClickMarker position={value} onMove={handleMapClick} />
          <MapController position={value} searchResult={searchResult} />
          <SearchControl onSelect={handleSearchSelect} lang={lang} />
          <LocateButton locating={locating} onLocate={handleLocate} />
        </MapContainer>
      </div>
      {locError && <p className="text-xs text-red-500 mt-1.5">{locError}</p>}
      {value && (
        <p className="text-xs text-[var(--muted)] mt-1.5">
          {value.lat.toFixed(5)}, {value.lng.toFixed(5)}
        </p>
      )}
    </div>
  )
}
