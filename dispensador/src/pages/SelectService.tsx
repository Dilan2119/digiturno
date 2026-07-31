import { useEffect, useState } from 'react'
import { Servicio, getServicios } from '../services/api'

interface Props {
  sedeId: number
  onSelect: (s: Servicio) => void
  onBack?: () => void
}

const ICONS: Record<string, string> = {
  VAC: '💉',
  ADM: '📋',
  MED: '🩺',
  FAR: '💊',
  LAB: '🔬',
  RAY: '🦴',
  ODON: '🦷',
  PED: '👶',
  PSI: '🧠',
  NUT: '🥗',
}

export default function SelectService({ sedeId, onSelect, onBack }: Props) {
  const [servicios, setServicios] = useState<Servicio[]>([])
  const [error, setError] = useState('')

  useEffect(() => {
    getServicios(sedeId)
      .then(setServicios)
      .catch((e) => setError(e.message))
  }, [sedeId])

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center">
        <div className="text-red-400 text-2xl mb-4">⚠️</div>
        <p className="text-red-300 text-lg mb-6">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="bg-white text-slate-900 px-8 py-4 rounded-2xl text-xl font-semibold active:scale-95 transition-transform"
        >
          Reintentar
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center min-h-screen px-6 py-8">
      {onBack && (
        <button onClick={onBack} className="self-start text-slate-400 hover:text-white mb-2 text-lg">← Volver</button>
      )}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-blue-300 mb-1">📟 Digiturno</h1>
        <p className="text-slate-400 text-sm">Seleccione el servicio</p>
      </div>

      {servicios.length === 0 ? (
        <div className="flex-1 flex items-center">
          <div className="animate-pulse text-slate-500 text-lg">Cargando servicios...</div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 w-full max-w-lg flex-1 content-center">
          {servicios.map((s) => (
            <button
              key={s.id}
              onClick={() => onSelect(s)}
              className="flex flex-col items-center justify-center bg-slate-800 hover:bg-slate-700 active:bg-blue-700 rounded-3xl p-6 min-h-[140px] transition-colors active:scale-95"
            >
              <span className="text-4xl mb-3">{ICONS[s.prefijo] || '📌'}</span>
              <span className="text-lg font-semibold text-white text-center leading-tight">
                {s.nombre}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
