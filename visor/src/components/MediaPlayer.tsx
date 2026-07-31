import { useState, useEffect, useCallback, useRef } from 'react'
import type { PlaylistItem } from '../services/api'

interface Props {
  items: PlaylistItem[]
}

export default function MediaPlayer({ items }: Props) {
  const [index, setIndex] = useState(0)
  const timerRef = useRef<number | null>(null)
  const active = items.length > 0

  const next = useCallback(() => {
    setIndex((i) => (i + 1) % items.length)
  }, [items.length])

  useEffect(() => {
    if (!active) return
    const item = items[index]

    if (item.tipo === 'imagen') {
      timerRef.current = window.setTimeout(next, 10000)
    }

    return () => {
      if (timerRef.current !== null) clearTimeout(timerRef.current)
    }
  }, [index, active, items, next])

  if (!active) {
    return (
      <div className="h-full flex items-center justify-center bg-slate-800 text-slate-500 text-4xl">
        Sin contenido multimedia
      </div>
    )
  }

  const item = items[index]

  if (item.tipo === 'imagen') {
    return (
      <div className="h-full flex items-center justify-center bg-black">
        <img
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
