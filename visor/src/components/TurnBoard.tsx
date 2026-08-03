import type { Turno } from '../services/api'

interface Props {
  turnoActual: Turno | null
  ultimosLlamados: Turno[]
}

export default function TurnBoard({ turnoActual, ultimosLlamados }: Props) {
  const lista = turnoActual
    ? ultimosLlamados.filter((t) => t.id !== turnoActual.id).slice(0, 4)
    : ultimosLlamados.slice(0, 4)

  return (
    <div className="h-full flex flex-col bg-slate-900 text-white overflow-hidden">

      {/* ── TURNO ACTUAL ── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-4">
        {turnoActual ? (
          <div className="w-full flex flex-col items-center gap-4">

            {/* Código grande */}
            <div className="font-mono font-black text-emerald-400 leading-none"
              style={{ fontSize: 'clamp(4rem, 12vw, 9rem)' }}>
              {turnoActual.codigo}
            </div>

            {/* Servicio — sin truncar, centrado */}
            <div className="text-center text-slate-200 font-medium leading-tight"
              style={{ fontSize: 'clamp(1.2rem, 3.5vw, 2.2rem)' }}>
              {turnoActual.servicio.nombre}
            </div>

            {/* Módulo — sin prefijo duplicado */}
            {turnoActual.modulo && (
              <div className="bg-amber-400/10 border border-amber-400/30 rounded-xl px-6 py-2 text-amber-400 font-semibold text-center"
                style={{ fontSize: 'clamp(1rem, 2.5vw, 1.6rem)' }}>
                📍 {turnoActual.modulo.nombre}
              </div>
            )}

            {/* Nombre del paciente si aplica */}
            {turnoActual.nombre && (
              <div className="text-slate-400 text-center"
                style={{ fontSize: 'clamp(0.9rem, 2vw, 1.3rem)' }}>
                {turnoActual.nombre}
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 text-slate-600">
            <span style={{ fontSize: 'clamp(3rem, 8vw, 5rem)' }}>⏳</span>
            <span style={{ fontSize: 'clamp(1rem, 2.5vw, 1.8rem)' }}>
              Esperando turno...
            </span>
          </div>
        )}
      </div>

      {/* ── ÚLTIMOS LLAMADOS ── */}
      <div className="border-t border-slate-700 bg-slate-800/50">
        <div className="px-5 py-2 flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-widest text-slate-500">
            Últimos llamados
          </span>
          <div className="flex-1 h-px bg-slate-700" />
        </div>

        {lista.length === 0 ? (
          <div className="px-5 pb-4 text-slate-600 text-sm">
            Sin movimientos recientes
          </div>
        ) : (
          <div className="divide-y divide-slate-700/60">
            {lista.map((t) => (
              <div key={t.id} className="flex items-center gap-4 px-5 py-2.5">
                {/* Código */}
                <div className="font-mono font-bold text-emerald-500 w-28 shrink-0"
                  style={{ fontSize: 'clamp(1rem, 2.2vw, 1.5rem)' }}>
                  {t.codigo}
                </div>

                {/* Servicio + nombre persona */}
                <div className="flex-1 leading-tight min-w-0">
                  <div className="text-slate-300"
                    style={{ fontSize: 'clamp(0.75rem, 1.6vw, 1rem)' }}>
                    {t.servicio.nombre}
                  </div>
                  {t.nombre && (
                    <div className="text-slate-500"
                      style={{ fontSize: 'clamp(0.65rem, 1.3vw, 0.85rem)' }}>
                      {t.nombre}
                    </div>
                  )}
                </div>

                {/* Módulo */}
                {t.modulo && (
                  <div className="shrink-0 text-amber-400 font-medium text-right"
                    style={{ fontSize: 'clamp(0.75rem, 1.6vw, 1rem)' }}>
                    {t.modulo.nombre}
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
