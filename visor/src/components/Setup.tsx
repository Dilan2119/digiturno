import { useState, useEffect } from 'react'
import { getSedes, getSalas, getVisores, SedeInfo, SalaInfo, VisorSimple } from '../services/api'

interface Props {
  onSelect: (salaId: number, visorId: number) => void
}

export default function Setup({ onSelect }: Props) {
  const [sedes, setSedes] = useState<SedeInfo[]>([])
  const [salas, setSalas] = useState<SalaInfo[]>([])
  const [visores, setVisores] = useState<VisorSimple[]>([])
  const [sedeId, setSedeId] = useState<number | null>(null)
  const [salaId, setSalaId] = useState<number | null>(null)
  const [visorId, setVisorId] = useState<number | null>(null)

  useEffect(() => { getSedes().then(setSedes).catch(() => {}) }, [])

  useEffect(() => {
    if (!sedeId) return
    setSalaId(null); setVisorId(null); setVisores([])
    getSalas(sedeId).then(setSalas).catch(() => {})
  }, [sedeId])

  useEffect(() => {
    if (!salaId) return
    setVisorId(null)
    getVisores(salaId).then(setVisores).catch(() => {})
  }, [salaId])

  const handleConfirm = () => {
    if (salaId && visorId) onSelect(salaId, visorId)
  }

  return (
    <div className="h-screen flex items-center justify-center bg-slate-900 p-8">
      <div className="bg-slate-800 rounded-3xl p-8 max-w-md w-full space-y-6">
        <h1 className="text-2xl font-bold text-center text-white">Configurar Visor</h1>

        <div>
          <label className="text-slate-400 text-sm block mb-1">Sede</label>
          <select
            value={sedeId ?? ''}
            onChange={(e) => setSedeId(parseInt(e.target.value, 10))}
            className="w-full bg-slate-700 rounded-xl px-4 py-3 text-white text-lg"
          >
            <option value="">Seleccionar sede</option>
            {sedes.map((s) => <option key={s.id} value={s.id}>{s.nombre}</option>)}
          </select>
        </div>

        <div>
          <label className="text-slate-400 text-sm block mb-1">Sala</label>
          <select
            value={salaId ?? ''}
            onChange={(e) => setSalaId(parseInt(e.target.value, 10))}
            className="w-full bg-slate-700 rounded-xl px-4 py-3 text-white text-lg"
            disabled={!sedeId}
          >
            <option value="">Seleccionar sala</option>
            {salas.map((s) => <option key={s.id} value={s.id}>{s.nombre}</option>)}
          </select>
        </div>

        <div>
          <label className="text-slate-400 text-sm block mb-1">Visor</label>
          <select
            value={visorId ?? ''}
            onChange={(e) => setVisorId(parseInt(e.target.value, 10))}
            className="w-full bg-slate-700 rounded-xl px-4 py-3 text-white text-lg"
            disabled={!salaId}
          >
            <option value="">Seleccionar visor</option>
            {visores.map((v) => <option key={v.id} value={v.id}>{v.nombre}</option>)}
          </select>
        </div>

        <button
          onClick={handleConfirm}
          disabled={!salaId || !visorId}
          className="w-full bg-blue-700 hover:bg-blue-600 disabled:opacity-40 rounded-xl py-4 text-lg font-bold transition-colors"
        >
          Iniciar Visor
        </button>
      </div>
    </div>
  )
}
