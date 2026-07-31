import { useState, useEffect } from 'react'
import { Sede, getSedes } from '../services/api'

interface Props {
  onSelect: (sede: Sede) => void
}

export default function SelectSede({ onSelect }: Props) {
  const [sedes, setSedes] = useState<Sede[]>([])

  useEffect(() => { getSedes().then(setSedes).catch(() => {}) }, [])

  return (
    <div className="flex flex-col min-h-screen items-center justify-center px-6 py-8">
      <h1 className="text-3xl font-bold text-white mb-2">Digiturno</h1>
      <p className="text-slate-400 mb-8">Seleccione la sede</p>
      <div className="w-full max-w-sm space-y-3">
        {sedes.map((s) => (
          <button
            key={s.id}
            onClick={() => onSelect(s)}
            className="w-full bg-slate-800 hover:bg-slate-700 rounded-2xl py-5 text-xl font-semibold text-white active:scale-95 transition-all"
          >
            {s.nombre}
          </button>
        ))}
      </div>
    </div>
  )
}
