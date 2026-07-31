import { useState, useEffect } from 'react'
import { Servicio } from '../services/api'

interface Props {
  servicio: Servicio
  onBack: () => void
  onConfirm: (nombre: string) => void
}

const ROWS = [
  ['Q','W','E','R','T','Y','U','I','O','P'],
  ['A','S','D','F','G','H','J','K','L','Ñ'],
  ['Z','X','C','V','B','N','M'],
]

export default function EnterName({ servicio, onBack, onConfirm }: Props) {
  const [value, setValue] = useState('')
  const [error, setError] = useState('')

  const handleKey = (key: string) => {
    setError('')
    if (key === '⌫') {
      setValue((v) => v.slice(0, -1))
    } else if (key === '✓') {
      if (value.trim().length < 2) {
        setError('Ingrese al menos 2 caracteres')
        return
      }
      onConfirm(value.trim())
    } else {
      if (value.length >= 30) return
      setValue((v) => v + key)
    }
  }

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Enter') { handleKey('✓'); return }
      if (e.key === 'Backspace') { handleKey('⌫'); return }
      if (e.key === 'Escape') { onBack(); return }
      if (e.key.length === 1 && /[a-zA-ZáéíóúñÑ ]/.test(e.key)) { handleKey(e.key.toUpperCase()); return }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  })

  return (
    <div className="flex flex-col min-h-screen px-6 py-8">
      <button
        onClick={onBack}
        className="self-start text-slate-400 hover:text-white mb-4 text-lg active:scale-95 transition-transform"
      >
        ← Volver
      </button>

      <div className="text-center mb-4">
        <p className="text-slate-400 text-sm mb-1">Servicio seleccionado</p>
        <p className="text-xl font-bold text-blue-300">{servicio.nombre}</p>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center max-w-2xl mx-auto w-full">
        <label className="text-slate-300 text-lg mb-3">Nombre completo</label>

        <div className="bg-slate-800 rounded-2xl px-6 py-4 mb-2 w-full text-center min-h-[60px] flex items-center justify-center">
          <span className={`text-3xl tracking-widest ${value ? 'text-white' : 'text-slate-600'}`}>
            {value || '••••••••'}
          </span>
        </div>

        {error && <p className="text-red-400 text-sm mb-2">{error}</p>}

        <div className="w-full max-w-2xl mt-4">
          {ROWS.map((row, i) => (
            <div key={i} className="flex gap-1.5 mb-1.5 justify-center">
              {row.map((key) => (
                <button
                  key={key}
                  onClick={() => handleKey(key)}
                  className="w-11 h-14 rounded-xl text-lg font-semibold bg-slate-700 hover:bg-slate-600 text-white active:scale-95 transition-transform"
                >
                  {key}
                </button>
              ))}
            </div>
          ))}
          <div className="flex gap-1.5 mt-1.5 justify-center">
            <button
              onClick={() => handleKey(' ')}
              className="w-48 h-14 rounded-xl text-lg font-semibold bg-slate-700 hover:bg-slate-600 text-white active:scale-95 transition-transform"
            >
              Espacio
            </button>
            <button
              onClick={() => handleKey('⌫')}
              className="w-24 h-14 rounded-xl text-lg font-semibold bg-red-900/50 text-red-300 active:scale-95 transition-transform"
            >
              ⌫
            </button>
            <button
              onClick={() => handleKey('✓')}
              className="w-24 h-14 rounded-xl text-lg font-semibold bg-green-700 text-white active:scale-95 transition-transform"
            >
              ✓
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}