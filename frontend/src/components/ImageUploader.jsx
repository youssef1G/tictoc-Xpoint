import { useState, useRef } from 'react'

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET

export default function ImageUploader({ images = [], onChange }) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef(null)

  async function uploadOne(file) {
    if (file.size > 10 * 1024 * 1024) throw new Error(file.name + ' is over 10MB')
    const fd = new FormData()
    fd.append('file', file)
    fd.append('upload_preset', UPLOAD_PRESET)
    const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
      method: 'POST', body: fd,
    })
    if (!res.ok) throw new Error('Upload failed')
    const data = await res.json()
    return data.secure_url
  }

  async function handleFiles(fileList) {
    if (!CLOUD_NAME || !UPLOAD_PRESET) {
      setError('Cloudinary is not configured. Set VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET in your .env file.')
      return
    }
    setError(''); setUploading(true)
    try {
      const urls = await Promise.all(Array.from(fileList).map(uploadOne))
      onChange([...images, ...urls])
    } catch (err) {
      console.error(err)
      setError(err.message)
    } finally { setUploading(false) }
  }

  function removeImage(idx) { onChange(images.filter((_, i) => i !== idx)) }

  function moveImage(idx, dir) {
    const next = [...images]; const target = idx + dir
    if (target < 0 || target >= next.length) return
    ;[next[idx], next[target]] = [next[target], next[idx]]
    onChange(next)
  }

  return (
    <div className="space-y-4">
      {images.length > 0 && (
        <div className="grid grid-cols-4 gap-3">
          {images.map((url, idx) => (
            <div key={url + idx} className="relative group rounded-xl overflow-hidden border border-[var(--border)] aspect-square">
              <img src={url} alt={''} className="w-full h-full object-cover" />
              {idx === 0 && (
                <span className="absolute top-1 left-1 bg-[var(--brand)] text-white text-[9px] font-semibold px-1.5 py-0.5 rounded-[4px]">Main</span>
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                {idx > 0 && (
                  <button type="button" onClick={() => moveImage(idx, -1)}
                    className="w-8 h-8 rounded-full bg-white text-gray-800 flex items-center justify-center hover:bg-[var(--brand)] hover:text-white transition-colors text-sm font-bold">&larr;</button>
                )}
                <button type="button" onClick={() => removeImage(idx)}
                  className="w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors text-sm font-bold">&times;</button>
                {idx < images.length - 1 && (
                  <button type="button" onClick={() => moveImage(idx, 1)}
                    className="w-8 h-8 rounded-full bg-white text-gray-800 flex items-center justify-center hover:bg-[var(--brand)] hover:text-white transition-colors text-sm font-bold">&rarr;</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <div onClick={() => inputRef.current?.click()}
        className="border-2 border-dashed rounded-2xl px-6 py-10 text-center cursor-pointer transition-colors border-[var(--border)] hover:border-[var(--brand)]/30 bg-[var(--surface)]">
        <input ref={inputRef} type="file" accept="image/*" multiple className="hidden" onChange={e => handleFiles(e.target.files)} />
        {uploading ? (
          <p className="text-xs text-[var(--muted)]">Uploading...</p>
        ) : (
          <>
            <p className="text-xs font-semibold text-[var(--text)]">Click to upload images</p>
            <p className="text-[11px] text-[var(--muted)] mt-1">Select multiple files at once</p>
          </>
        )}
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}
      {images.length > 0 && (
        <p className="text-[11px] text-[var(--muted)]">The first image is the main photo.</p>
      )}
    </div>
  )
}
