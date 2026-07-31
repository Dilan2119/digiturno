import { useState, useEffect } from 'react'
import { Servicio } from '../services/api'

interface Props {
  servicio: Servicio
  nombre: string
  onBack: () => void
  onConfirm: (cedula: string) => void
}

const KEYS = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['⌫', '0', '✓'],
]

export default function EnterCedula({ servicio, nombre, onBack, onConfirm }: Props) {
  const [value, setValue] = useState('')
  const [error, setError] = useState('')

  const handleKey = (key: string) => {
    setError('')
    if (key === '⌫') {
      setValue((v) => v.slice(0, -1))
    } else if (key === '✓') {
      if (value.length < 4) {
        setError('Ingrese al menos 4 dígitos')
        return
      }
      onConfirm(value)
    } else {
      if (value.length >= 15) return
      setValue((v) => v + key)
    }
  }

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Enter') { handleKey('✓'); return }
      if (e.key === 'Backspace') { handleKey('⌫'); return }
      if (e.key === 'Escape') { onBack(); return }
      if (/^[0-9]$/.test(e.key)) { handleKey(e.key); return }
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

      <div className="text-center mb-6">
        <p className="text-slate-400 text-sm mb-1">Servicio seleccionado</p>
        <p className="text-xl font-bold text-blue-300">{servicio.nombre}</p>
        <p className="text-slate-400 text-sm mt-2">Paciente: <span className="text-white font-semibold">{nombre}</span></p>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center max-w-sm mx-auto w-full">
        <label className="text-slate-300 text-lg mb-3">Número de cédula</label>

        <div className="bg-slate-800 rounded-2xl px-6 py-4 mb-2 w-full text-center min-h-[60px] flex items-center justify-center">
          <span className={`text-3xl font-mono tracking-widest ${value ? 'text-white' : 'text-slate-600'}`}>
            {value || '••••'}
          </span>
        </div>

        {error && <p className="text-red-400 text-sm mb-2">{error}</p>}

        <div className="w-full max-w-xs mt-4">
          {KEYS.map((row, i) => (
            <div key={i} className="flex gap-3 mb-3">
              {row.map((key) => (
                <button
                  key={key}
                  onClick={() => handleKey(key)}
                  className={`flex-1 h-16 rounded-2xl text-2xl font-bold active:scale-95 transition-transform ${
                    key === '⌫'
                      ? 'bg-red-900/50 text-red-300'
                      : key === '✓'
                      ? 'bg-green-700 text-white'
                      : 'bg-slate-700 hover:bg-slate-600 text-white'
                  }`}
                >
                  {key === '✓' ? 'OK' : key}
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
