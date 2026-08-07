import { useEffect, useState } from 'react'
import { Servicio, getServicios } from '../services/api'

interface Props {
  sedeId: number
  sedeName?: string
  onSelect: (s: Servicio) => void
  onBack?: () => void
  onLogout?: () => void
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

export default function SelectService({ sedeId, sedeName, onSelect, onBack, onLogout }: Props) {
  const [servicios, setServicios] = useState<Servicio[]>([])
  const [error, setError] = useState('')

  useEffect(() => {
    getServicios(sedeId)
      .then(setServicios)
      .catch((e) => setError(e.message))
  }, [sedeId])

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center bg-gradient-to-b from-[#0D2E5A] to-[#1B3A6B]">
        <div className="text-red-400 text-2xl mb-4">⚠️</div>
        <p className="text-red-300 text-lg mb-6">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="bg-white text-[#0D2E5A] px-8 py-4 rounded-2xl text-xl font-semibold active:scale-95 transition-transform"
        >
          Reintentar
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center min-h-screen px-6 py-8 bg-gradient-to-b from-[#0D2E5A] to-[#1B3A6B]">
      {/* Header with logout */}
      <div className="w-full flex items-start justify-between mb-6">
        <div></div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>
            <h1 className="text-2xl font-bold text-white">IPS Clinical House</h1>
          </div>
          <p className="text-[#29ABE2] font-semibold tracking-wide">Digiturno</p>
          {sedeName && (
            <p className="text-white/60 text-sm mt-1">📍 {sedeName}</p>
          )}
        </div>
        {onLogout && (
          <button
            onClick={onLogout}
            className="text-white/50 hover:text-white text-xs border border-white/20 rounded-lg px-3 py-1.5 transition-colors"
          >
            Salir
          </button>
        )}
      </div>

      <h2 className="text-xl text-white mb-8 font-medium">Seleccione el Servicio que desea</h2>


      {servicios.length === 0 ? (
        <div className="flex-1 flex items-center">
          <svg className="animate-spin h-10 w-10 text-[#29ABE2]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 w-full max-w-lg flex-1 content-start">
          {servicios.map((s) => (
            <button
              key={s.id}
              onClick={() => onSelect(s)}
              className="relative overflow-hidden flex flex-col items-center justify-center bg-white rounded-2xl p-6 min-h-[140px] transition-all hover:scale-[1.02] hover:shadow-[0_0_15px_rgba(41,171,226,0.5)] active:scale-95"
            >
              <div className="absolute left-0 top-0 bottom-0 w-2 bg-[#1B5FAE]"></div>
              <span className="text-4xl mb-3">{ICONS[s.prefijo] || '📌'}</span>
              <span className="text-lg font-semibold text-[#0D2E5A] text-center leading-tight">
                {s.nombre}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
