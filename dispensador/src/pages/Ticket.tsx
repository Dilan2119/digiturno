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
    <div className="flex flex-col items-center justify-center min-h-screen px-6 py-8 text-center bg-white">
      <div className="animate-bounce-in flex flex-col items-center">
        <div className="mb-4">
          <svg className="w-20 h-20 text-green-500 animate-[pulse_1s_ease-in-out_infinite]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        </div>
        <h1 className="text-3xl font-bold text-[#0D2E5A] mb-2">Turno Asignado</h1>
        <div className="bg-white border-4 border-[#0D2E5A] rounded-3xl px-12 py-8 mb-6 inline-block shadow-lg">
          <span className="text-6xl font-bold tracking-widest text-[#29ABE2] font-mono">
            {turno.codigo}
          </span>
        </div>
      </div>

      <p className="text-[#6B7A8D] text-lg font-medium mb-10">
        Espere a ser llamado. Por favor mantenga su turno visible.
      </p>

      <div className="flex flex-col gap-4 mb-12 w-full max-w-xs">
        <button
          onClick={handlePrint}
          className="bg-[#E8F6FD] text-[#1B5FAE] border border-[#1B5FAE] hover:bg-blue-50 active:bg-blue-100 rounded-2xl px-8 py-4 text-lg font-semibold active:scale-95 transition-transform w-full"
        >
          🖨️ Imprimir
        </button>
        <button
          onClick={onReset}
          className="bg-[#1B5FAE] text-white hover:bg-blue-700 rounded-2xl px-8 py-4 text-lg font-semibold active:scale-95 transition-transform w-full"
        >
          📟 Nuevo turno
        </button>
      </div>

      <div className="bg-[#E8F6FD] text-[#0D2E5A] rounded-full px-6 py-2 text-sm font-semibold shadow-sm">
        Volviendo al inicio en <span className="font-mono text-[#1B5FAE] ml-1">{countdown}s</span>
      </div>
    </div>
  )
}
