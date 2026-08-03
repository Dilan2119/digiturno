import { useState, useEffect, useCallback, useRef } from 'react'
import type { PlaylistItem } from '../services/api'

interface Props {
  items: PlaylistItem[]
}

export default function MediaPlayer({ items }: Props) {
  // Filtrar solo activos (el backend ya filtra, pero por si acaso)
  const activeItems = items.filter(i => i.activo !== false)
  const [index, setIndex] = useState(0)
  const timerRef = useRef<number | null>(null)
  const active = activeItems.length > 0

  // Resetear índice si la playlist cambia y el índice queda fuera de rango
  useEffect(() => {
    setIndex(0)
  }, [activeItems.length])

  const next = useCallback(() => {
    setIndex((i) => (i + 1) % activeItems.length)
  }, [activeItems.length])

  useEffect(() => {
    if (!active) return
    const item = activeItems[index]
    if (!item) { setIndex(0); return }

    if (item.tipo === 'imagen') {
      timerRef.current = window.setTimeout(next, 10000)
    }

    return () => {
      if (timerRef.current !== null) clearTimeout(timerRef.current)
    }
  }, [index, active, activeItems, next])

  if (!active) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-slate-800 text-slate-500 gap-3">
        <span className="text-5xl">📺</span>
        <span className="text-lg">Sin contenido multimedia</span>
        <span className="text-sm text-slate-600">Agrega imágenes o videos desde el CMS → Multimedia</span>
      </div>
    )
  }

  const item = activeItems[index]

  if (item.tipo === 'imagen') {
    return (
      <div className="h-full flex items-center justify-center bg-black">
        <img
          key={item.id}
          src={item.url}
          alt=""
          className="max-h-full max-w-full object-contain"
          draggable={false}
        />
      </div>
    )
  }

  return (
    <div className="h-full flex items-center justify-center bg-black">
      <video
        key={item.id}
        src={item.url}
        className="max-h-full max-w-full"
        autoPlay
        muted
        playsInline
        onEnded={next}
      />
    </div>
  )
}
