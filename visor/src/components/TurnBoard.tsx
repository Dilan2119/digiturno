import type { Turno } from '../services/api'

interface Props {
  turnoActual: Turno | null
  ultimosLlamados: Turno[]
}

function TurnoCard({ turno, large }: { turno: Turno; large?: boolean }) {
  const modulo = turno.modulo?.nombre ?? '---'

  return (
    <div className={`flex items-center gap-6 ${large ? 'py-6' : 'py-3 border-t border-slate-700'}`}>
      <div className={`font-mono font-bold text-emerald-400 ${large ? 'text-8xl' : 'text-4xl'}`}>
        {turno.codigo}
      </div>
      <div className="flex-1 min-w-0">
        <div className={`text-slate-300 truncate ${large ? 'text-3xl' : 'text-xl'}`}>
          {turno.servicio.nombre}
        </div>
        <div className={`text-slate-400 ${large ? 'text-2xl mt-2' : 'text-lg'}`}>
          {turno.nombre || '---'}
        </div>
      </div>
      <div className={`font-semibold text-amber-400 ${large ? 'text-3xl' : 'text-xl'}`}>
        Mod. {modulo}
      </div>
    </div>
  )
}

export default function TurnBoard({ turnoActual, ultimosLlamados }: Props) {
  const lista = turnoActual
    ? ultimosLlamados.filter((t) => t.id !== turnoActual.id).slice(0, 4)
    : ultimosLlamados.slice(0, 4)

  return (
    <div className="h-full flex flex-col bg-slate-900 p-8">
      <div className="flex-1 flex flex-col justify-center">
        {turnoActual ? (
          <TurnoCard turno={turnoActual} large />
        ) : (
          <div className="text-5xl text-slate-600 text-center">
            Esperando turno...
          </div>
        )}
      </div>

      <div className="border-t-2 border-slate-700 pt-4">
        <h2 className="text-xl text-slate-500 uppercase tracking-wider mb-2">
          Últimos llamados
        </h2>
        {lista.length === 0 ? (
          <p className="text-slate-600 text-lg">Sin movimientos recientes</p>
        ) : (
          lista.map((t) => (
            <TurnoCard key={t.id} turno={t} />
          ))
        )}
      </div>
    </div>
  )
}
