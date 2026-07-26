import { useEffect, useRef, useState, useCallback } from 'react'
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import { useLocale } from '../context/LocaleContext.jsx'
import { LoaderCircle, MapPin } from 'lucide-react'
import 'leaflet/dist/leaflet.css'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

function LocateButton({ locating, onLocate }) {
  const { t } = useLocale()
  const map = useMap()
  return (
    <div className="leaflet-top leaflet-left" style={{ marginTop: 10, marginLeft: 10 }}>
      <button type="button" onClick={onLocate} disabled={locating}
        className="leaflet-control text-xs font-semibold flex items-center gap-1.5 disabled:opacity-50"
        style={{
          background: 'white', border: '2px solid rgba(0,0,0,0.15)',
          borderRadius: 6, padding: '8px 12px', cursor: 'pointer',
          boxShadow: '0 1px 5px rgba(0,0,0,0.15)',
        }}>
        {locating ? <LoaderCircle className="w-3.5 h-3.5 animate-spin" /> : <MapPin className="w-3.5 h-3.5" />}
        <span>{locating ? '…' : t('checkout.locateMe')}</span>
      </button>
    </div>
  )
}

function ClickMarker({ position, onMove }) {
  useMapEvents({
    click(e) {
      onMove(e.latlng)
    },
  })
  return position ? <Marker position={position} draggable={true} eventHandlers={{ dragend: (e) => onMove(e.target.getLatLng()) }} /> : null
}

function FitBounds({ position }) {
  const map = useMap()
  const fitted = useRef(false)
  useEffect(() => {
    if (position && !fitted.current) {
      map.setView(position, 15)
      fitted.current = true
    }
  }, [position, map])
  return null
}

export default function LocationPicker({ value, onChange }) {
  const { t } = useLocale()
  const [locating, setLocating] = useState(false)
  const [locError, setLocError] = useState('')

  const defaultCenter = { lat: 26.8206, lng: 30.8025 }
  const center = value || defaultCenter

  const handleMapClick = useCallback((latlng) => {
    onChange({ lat: latlng.lat, lng: latlng.lng })
    setLocError('')
  }, [onChange])

  const handleLocate = useCallback(() => {
    if (!navigator.geolocation) { setLocError(t('checkout.locationUnsupported')); return }
    setLocating(true)
    setLocError('')
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        onChange({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        setLocating(false)
      },
      () => { setLocError(t('checkout.locationError')); setLocating(false) },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }, [onChange, t])

  return (
    <div>
      <div className="rounded-2xl overflow-hidden border border-[var(--border)]" style={{ height: 280 }}>
        <MapContainer center={center} zoom={value ? 15 : 6} scrollWheelZoom={true}
          style={{ height: '100%', width: '100%' }}
          zoomControl={false}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <ClickMarker position={value} onMove={handleMapClick} />
          <FitBounds position={value} />
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
