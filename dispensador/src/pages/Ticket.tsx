import { useEffect, useState, useRef } from 'react'
import { Turno } from '../services/api'

interface Props {
  turno: Turno
  onReset: () => void
}

export default function Ticket({ turno, onReset }: Props) {
  const [countdown, setCountdown] = useState(5)
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>()

  useEffect(() => {
    if (countdown <= 0) {
      onReset()
      return
    }
    timeoutRef.current = setTimeout(() => setCountdown((c) => c - 1), 1000)
    return () => clearTimeout(timeoutRef.current)
  }, [countdown, onReset])

  const handlePrint = () => {
    // placeholder — impresión no implementada
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 py-8 text-center">
      <div className="animate-bounce-in">
        <div className="text-5xl mb-4">🎉</div>
        <h1 className="text-xl text-slate-300 mb-2">Su turno</h1>
        <div className="bg-slate-800 border-2 border-blue-500 rounded-3xl px-8 py-6 mb-6 inline-block">
          <span className="text-5xl font-bold tracking-widest text-blue-400 font-mono">
            {turno.codigo}
          </span>
        </div>
      </div>

      <p className="text-slate-400 text-sm mb-8">
        Espere a ser llamado. Por favor mantenga su turno visible.
      </p>

      <div className="flex gap-4 mb-12">
        <button
          onClick={handlePrint}
          className="bg-slate-700 hover:bg-slate-600 active:bg-slate-500 rounded-2xl px-8 py-4 text-lg font-semibold active:scale-95 transition-transform"
        >
          🖨️ Imprimir
        </button>
        <button
          onClick={onReset}
          className="bg-blue-700 hover:bg-blue-600 rounded-2xl px-8 py-4 text-lg font-semibold active:scale-95 transition-transform"
        >
          📟 Nuevo turno
        </button>
      </div>

      <p className="text-slate-600 text-sm">
        Volviendo al inicio en <span className="text-white font-mono">{countdown}</span>s
      </p>
    </div>
  )
}
