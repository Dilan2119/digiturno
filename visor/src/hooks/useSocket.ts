import { useEffect, useRef, useCallback, useState } from 'react'
import { io, Socket } from 'socket.io-client'
import type { Turno } from '../services/api'

export const WS_BASE = (import.meta.env.VITE_WS_URL as string) || '';

export interface SocketCallbacks {
  onReconciliar: (visorId: number) => void
  onReconnect: () => void
  onTurnoLlamado: (turno: Turno) => void
  onTurnoReLlamado: (turno: Turno) => void
  onTurnoAusente: (turno: Turno) => void
  onAtencionFinalizada: (turno: Turno) => void
}

export function useSocket(salaId: number | null, callbacks: SocketCallbacks) {
  const [connected, setConnected] = useState(false)
  const cbRef = useRef(callbacks)
  cbRef.current = callbacks
  const socketRef = useRef<Socket | null>(null)

  const reconnect = useCallback(() => {
    socketRef.current?.disconnect()
    if (!salaId) return
    const socket = io(WS_BASE + '/visor', { query: { salaId: String(salaId) } })

    socket.on('connect', () => {
      setConnected(true)
      cbRef.current.onReconnect()
    })
    socket.on('disconnect', () => setConnected(false))
    socket.on('connect_error', () => setConnected(false))

    socket.on('reconciliar-estado', (data: { visorId: number }) => {
      cbRef.current.onReconciliar(data.visorId)
    })

    socket.on('turno-llamado', (turno: Turno) => {
      cbRef.current.onTurnoLlamado(turno)
    })

    socket.on('turno-re-llamado', (turno: Turno) => {
      cbRef.current.onTurnoReLlamado(turno)
    })

    socket.on('turno-ausente', (turno: Turno) => {
      cbRef.current.onTurnoAusente(turno)
    })

    socket.on('atencion-finalizada', (turno: Turno) => {
      cbRef.current.onAtencionFinalizada(turno)
    })

    socketRef.current = socket
  }, [salaId])

  useEffect(() => {
    reconnect()
    return () => { socketRef.current?.disconnect() }
  }, [reconnect])

  return { connected, socket: socketRef }
}
