import { useEffect, useState } from 'react'
import type { Turno } from '../services/api'

interface Props {
  turnoActual: Turno | null
  ultimosLlamados: Turno[]
}

export default function TurnBoard({ turnoActual, ultimosLlamados }: Props) {
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(interval)
  }, [])

  const lista = turnoActual
    ? ultimosLlamados.filter((t) => t.id !== turnoActual.id).slice(0, 4)
    : ultimosLlamados.slice(0, 4)

  return (
    <div className="h-full flex flex-col bg-[#0D2E5A] text-white overflow-hidden">

      {/* ── TOP BAR ── */}
      <div className="flex justify-between items-center px-6 py-4 border-b border-[#1B5FAE]/30 bg-[#0D2E5A]">
        <div className="flex items-center gap-3">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>
          <div className="flex flex-col">
            <span className="text-xl font-bold text-white leading-none">IPS Clinical House</span>
            <span className="text-sm font-semibold text-[#29ABE2]">Digiturno</span>
          </div>
        </div>
        <div className="text-xl font-mono text-white/90">
          {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>

      {/* ── TURNO ACTUAL ── */}
      <div className="h-[65%] flex flex-col items-center justify-center px-6 py-4">
        {turnoActual ? (
          <div key={turnoActual.id} className="w-full flex flex-col items-center gap-4 animate-[pulse_0.5s_ease-in-out]">

            {/* Código grande */}
            <div className="font-mono font-black text-[#29ABE2] leading-none drop-shadow-lg"
              style={{ fontSize: 'clamp(5rem, 15vw, 12rem)' }}>
              {turnoActual.codigo}
            </div>

            {/* Servicio — sin truncar, centrado */}
            <div className="text-center text-white font-medium leading-tight mt-4"
              style={{ fontSize: 'clamp(1.5rem, 4vw, 2.5rem)' }}>
              {turnoActual.servicio.nombre}
            </div>

            {/* Módulo — sin prefijo duplicado */}
            {turnoActual.modulo && (
              <div className="bg-amber-500/20 border border-amber-400 rounded-2xl px-8 py-3 text-amber-400 font-bold text-center mt-2 shadow-[0_0_15px_rgba(251,191,36,0.3)]"
                style={{ fontSize: 'clamp(1.2rem, 3vw, 2rem)' }}>
                Módulo {turnoActual.modulo.nombre}
              </div>
            )}

            {/* Nombre del paciente si aplica */}
            {turnoActual.nombre && (
              <div className="text-[#6B7A8D] text-center mt-2 font-medium"
                style={{ fontSize: 'clamp(1rem, 2.5vw, 1.5rem)' }}>
                {turnoActual.nombre}
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 text-[#6B7A8D]">
            <span style={{ fontSize: 'clamp(4rem, 10vw, 6rem)' }}>⏳</span>
            <span style={{ fontSize: 'clamp(1.5rem, 3vw, 2.2rem)' }}>
              Esperando turno...
            </span>
          </div>
        )}
      </div>

      {/* ── ÚLTIMOS LLAMADOS ── */}
      <div className="flex-1 border-t-2 border-[#1B5FAE]/40 bg-[#0D2E5A]/90 overflow-hidden flex flex-col">
        <div className="px-6 py-3 flex items-center gap-3">
          <span className="text-sm font-bold uppercase tracking-widest text-[#29ABE2]">
            Últimos llamados
          </span>
          <div className="flex-1 h-px bg-[#1B5FAE]/40" />
        </div>

        {lista.length === 0 ? (
          <div className="px-6 pb-4 text-[#6B7A8D] text-lg">
            Sin movimientos recientes
          </div>
        ) : (
          <div className="flex flex-col flex-1 px-4 gap-2 pb-4 overflow-hidden">
            {lista.map((t) => (
              <div key={t.id} className="flex items-center gap-4 px-6 py-3 bg-[#1B5FAE]/10 rounded-xl border border-[#1B5FAE]/20">
                {/* Código */}
                <div className="font-mono font-bold text-[#29ABE2] w-32 shrink-0"
                  style={{ fontSize: 'clamp(1.2rem, 2.5vw, 1.8rem)' }}>
                  {t.codigo}
                </div>

                {/* Servicio + nombre persona */}
                <div className="flex-1 leading-tight min-w-0">
                  <div className="text-gray-200 font-medium"
                    style={{ fontSize: 'clamp(0.9rem, 1.8vw, 1.2rem)' }}>
                    {t.servicio.nombre}
                  </div>
                  {t.nombre && (
                    <div className="text-[#6B7A8D]"
                      style={{ fontSize: 'clamp(0.8rem, 1.5vw, 1rem)' }}>
                      {t.nombre}
                    </div>
                  )}
                </div>

                {/* Módulo */}
                {t.modulo && (
                  <div className="shrink-0 text-amber-400 font-bold text-right"
                    style={{ fontSize: 'clamp(0.9rem, 1.8vw, 1.3rem)' }}>
                    Módulo {t.modulo.nombre}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
