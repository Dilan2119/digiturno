import { useState, useEffect, useCallback, useRef } from 'react'
import { useSocket } from './hooks/useSocket'
import { getVisor, getEstadoActual } from './services/api'
import Setup from './components/Setup'
import { audioService } from './services/audio'
import MediaPlayer from './components/MediaPlayer'
import TurnBoard from './components/TurnBoard'
import type { PlaylistItem, VisorInfo, Turno } from './services/api'

export default function App() {
  const [visorId, setVisorId] = useState<number | null>(null)
  const [salaId, setSalaId] = useState<number | null>(null)
  const [visorInfo, setVisorInfo] = useState<VisorInfo | null>(null)
  const [playlist, setPlaylist] = useState<PlaylistItem[]>([])
  const [turnoActual, setTurnoActual] = useState<Turno | null>(null)
  const [ultimosLlamados, setUltimosLlamados] = useState<Turno[]>([])
  const [audioUnlocked, setAudioUnlocked] = useState(false)
  const reconcilingRef = useRef(false)

  const [needsSetup, setNeedsSetup] = useState(true)

  useEffect(() => {
    const unlock = () => { audioService.unlock(); setAudioUnlocked(true) };
    document.addEventListener('click', unlock, { once: true });
    document.addEventListener('touchstart', unlock, { once: true });
    return () => {
      document.removeEventListener('click', unlock);
      document.removeEventListener('touchstart', unlock);
    };
  }, []);

  useEffect(() => {
    const p = new URLSearchParams(window.location.search)
    const vid = p.get('visorId')
    const sid = p.get('salaId')
    if (vid && sid) {
      setVisorId(Number(vid))
      setSalaId(Number(sid))
      setNeedsSetup(false)
    }
  }, [])

  const handleSetup = (salaId: number, visorId: number) => {
    setSalaId(salaId)
    setVisorId(visorId)
    setNeedsSetup(false)
    window.history.replaceState(null, '', `?salaId=${salaId}&visorId=${visorId}`)
  }

  const fetchVisor = useCallback(async (id: number) => {
    try {
      const data = await getVisor(id)
      setVisorInfo(data)
      setPlaylist(data.playlists ?? [])
    } catch { /* will retry on reconnect */ }
  }, [])

  const reconciliar = useCallback(async (id: number) => {
    if (id !== visorId || reconcilingRef.current) return
    reconcilingRef.current = true
    try {
      const estado = await getEstadoActual(id)
      setTurnoActual(estado.turnoActual)
      setUltimosLlamados(estado.ultimosLlamados ?? [])
    } catch { /* silent */ }
    reconcilingRef.current = false
  }, [visorId])

  useEffect(() => {
    if (visorId) fetchVisor(visorId)
  }, [visorId, fetchVisor])

  // Recargar playlist cada 30 segundos para detectar cambios desde el CMS
  useEffect(() => {
    if (!visorId) return
    const interval = setInterval(() => fetchVisor(visorId), 30000)
    return () => clearInterval(interval)
  }, [visorId, fetchVisor])

  const handleTurnoLlamado = useCallback((turno: Turno) => {
    // Filtrar si el Visor tiene servicios asignados
    if (visorInfo?.sala?.servicios && visorInfo.sala.servicios.length > 0) {
      if (!visorInfo.sala.servicios.find(s => s.id === turno.servicioId)) return;
    }
    setTurnoActual(turno)
    setUltimosLlamados((prev) => [turno, ...prev].slice(0, 10))
    const mod = turno.modulo?.nombre ?? ''
    audioService.playTurnoLlamado(turno.codigo, mod, turno.nombre)
  }, [visorInfo])

  const handleTurnoReLlamado = useCallback((turno: Turno) => {
    if (visorInfo?.sala?.servicios && visorInfo.sala.servicios.length > 0) {
      if (!visorInfo.sala.servicios.find(s => s.id === turno.servicioId)) return;
    }
    setTurnoActual(turno)
    const mod = turno.modulo?.nombre ?? ''
    audioService.playTurnoReLlamado(turno.codigo, mod, turno.nombre)
  }, [visorInfo])

  const handleTurnoAusente = useCallback(() => {
    if (visorId) reconciliar(visorId)
  }, [visorId, reconciliar])

  const handleAtencionFinalizada = useCallback(() => {
    if (visorId) reconciliar(visorId)
  }, [visorId, reconciliar])

  const handleReconnect = useCallback(() => {
    if (visorId) reconciliar(visorId)
  }, [visorId, reconciliar])

  const { connected } = useSocket(salaId, {
    onReconciliar: reconciliar,
    onReconnect: handleReconnect,
    onTurnoLlamado: handleTurnoLlamado,
    onTurnoReLlamado: handleTurnoReLlamado,
    onTurnoAusente: handleTurnoAusente,
    onAtencionFinalizada: handleAtencionFinalizada,
  })

  if (needsSetup) return <Setup onSelect={handleSetup} />

  return (
    <div className="h-screen flex">
      <div className="w-[55%] h-full">
        <MediaPlayer items={playlist} />
      </div>
      <div className="w-[45%] h-full flex flex-col">
        <div className="flex items-center justify-between px-6 py-2 bg-slate-800 text-xs text-slate-500">
          <span>{visorInfo?.nombre ?? 'Visor'}</span>
          <div className="flex items-center gap-3">
            {!audioUnlocked && <span className="text-amber-400">🔇 Tocar para activar sonido</span>}
            <span className={`inline-block w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`} />
          </div>
        </div>
        <div className="flex-1 overflow-hidden">
          <TurnBoard
            turnoActual={turnoActual}
            ultimosLlamados={ultimosLlamados}
          />
        </div>
      </div>
    </div>
  )
}
