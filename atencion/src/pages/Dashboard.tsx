import { useEffect, useState, useCallback, useRef } from 'react';
import { Socket } from 'socket.io-client';
import { ColaGrupo, Turno, Modulo, getColas, getModulos, Servicio } from '../services/api';

interface Props {
  socket: Socket | null;
  sedeId: number;
  onLogout: () => void;
}

export default function Dashboard({ socket, sedeId, onLogout }: Props) {
  const [queue, setQueue] = useState<ColaGrupo[]>([]);
  const [currentTurn, setCurrentTurn] = useState<Turno | null>(null);
  const [modulos, setModulos] = useState<Modulo[]>([]);
  const [moduloId, setModuloId] = useState<number | null>(() => {
    const m = localStorage.getItem('atencion_moduloId');
    return m ? parseInt(m, 10) : null;
  });
  const [wsStatus, setWsStatus] = useState<'connected' | 'disconnected' | 'connecting'>('disconnected');

  useEffect(() => {
    getModulos(sedeId).then(setModulos);
    getColas(sedeId).then(setQueue);
  }, [sedeId]);

  useEffect(() => {
    if (!socket) { setWsStatus('disconnected'); return; }
    const onConnect = () => setWsStatus('connected');
    const onDisconnect = () => setWsStatus('disconnected');
    const onConnectError = () => setWsStatus('disconnected');

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('connect_error', onConnectError);

    if (socket.connected) setWsStatus('connected');

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('connect_error', onConnectError);
    };
  }, [socket]);

  useEffect(() => {
    if (!socket) return;
    const handleTurnoLlamado = (t: Turno) => {
      setCurrentTurn(t);
      setQueue((prev) => prev.map((g) => ({ ...g, turnos: g.turnos.filter((x) => x.id !== t.id) })));
    };
    const handleReLlamado = (t: Turno) => {
      setCurrentTurn((prev) => (prev?.id === t.id ? { ...prev, ...t } : prev));
    };
    const handleAusente = (t: Turno) => {
      setCurrentTurn((prev) => (prev?.id === t.id ? null : prev));
    };
    const handleFinalizada = (t: Turno) => {
      setCurrentTurn((prev) => (prev?.id === t.id ? null : prev));
    };

    const handleTurnoCreado = (t: Turno) => {
      setQueue((prev) => {
        const grupoIndex = prev.findIndex((g) => g.servicio.id === t.servicio?.id);
        if (grupoIndex !== -1) {
          const next = [...prev];
          next[grupoIndex] = { ...next[grupoIndex], turnos: [...next[grupoIndex].turnos, t] };
          return next;
        }
        return prev;
      });
    };

    socket.on('turno-creado', handleTurnoCreado);
    socket.on('turno-llamado', handleTurnoLlamado);
    socket.on('turno-re-llamado', handleReLlamado);
    socket.on('turno-ausente', handleAusente);
    socket.on('atencion-finalizada', handleFinalizada);

    return () => {
      socket.off('turno-creado', handleTurnoCreado);
      socket.off('turno-llamado', handleTurnoLlamado);
      socket.off('turno-re-llamado', handleReLlamado);
      socket.off('turno-ausente', handleAusente);
      socket.off('atencion-finalizada', handleFinalizada);
    };
  }, [socket]);

  const emitEvent = useCallback(
    (event: string, payload: any) => {
      if (!socket) return;
      socket.emit(event, payload, (res: any) => {
        if (res?.success === false) alert(res.message);
      });
    },
    [socket],
  );

  const llamarSiguiente = (servicioId?: number) => {
    if (!moduloId) { alert('Seleccione un módulo primero'); return; }
    
    // Si se pasa un servicioId, busca el primer turno de ese servicio. Si no, el primero global.
    let first: Turno | undefined;
    if (servicioId) {
      const grupo = queue.find((g) => g.servicio.id === servicioId);
      first = grupo?.turnos[0];
    } else {
      first = queue.flatMap((g) => g.turnos)[0];
    }

    if (!first) { alert('No hay turnos en espera para llamar'); return; }
    emitEvent('llamar-turno', { turnoId: first.id, moduloId });
  };


  const reLlamar = () => {
    if (!currentTurn) return;
    emitEvent('re-llamar-turno', { turnoId: currentTurn.id });
  };

  const marcarAusente = () => {
    if (!currentTurn) return;
    emitEvent('turno-ausente', { turnoId: currentTurn.id });
  };

  const finalizar = () => {
    if (!currentTurn) return;
    emitEvent('finalizar-atencion', { turnoId: currentTurn.id });
  };

  const totalWaiting = queue.reduce((s, g) => s + g.turnos.length, 0);

  return (
    <div className="flex flex-col min-h-screen bg-[#E8F6FD] font-sans">
      {/* Header */}
      <header className="bg-[#0D2E5A] px-6 py-4 flex items-center justify-between flex-wrap gap-4 shadow-md">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path>
            </svg>
            <span className="text-white font-bold text-xl tracking-wide">IPS Clinical House</span>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={moduloId ?? ''}
              onChange={(e) => {
                const id = e.target.value ? Number(e.target.value) : null;
                setModuloId(id);
                if (id) localStorage.setItem('atencion_moduloId', id.toString());
                else localStorage.removeItem('atencion_moduloId');
              }}
              className="bg-white border-2 border-[#29ABE2] rounded-lg px-3 py-1.5 text-sm text-[#0D2E5A] font-medium focus:outline-none focus:ring-2 focus:ring-[#29ABE2]"
            >
              <option value="">Seleccione Módulo</option>
              {modulos.map((m) => <option key={m.id} value={m.id}>{m.nombre}</option>)}
            </select>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-sm bg-black/20 px-3 py-1.5 rounded-full">
            <span className={`w-2.5 h-2.5 rounded-full ${
              wsStatus === 'connected' ? 'bg-green-400' : 'bg-red-500'
            }`} />
            <span className="text-white/90 font-medium">{wsStatus === 'connected' ? 'En línea' : 'Desconectado'}</span>
          </div>
          <button onClick={onLogout} className="text-sm text-white/80 hover:text-white font-medium transition-colors">Cerrar Sesión</button>
        </div>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row gap-6 p-6 overflow-auto">
        {/* Left: Queue */}
        <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 overflow-auto">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
            <h2 className="text-xl font-bold text-[#0D2E5A]">
              Pacientes en Espera <span className="text-sm font-medium text-[#6B7A8D] bg-gray-100 px-2 py-1 rounded-full ml-2">{totalWaiting}</span>
            </h2>
          </div>
          {queue.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-[#6B7A8D]">
              <svg className="w-12 h-12 mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <p className="text-lg">No hay pacientes en espera</p>
            </div>
          ) : (
            <div className="space-y-6">
              {queue.map((grupo) => (
                <div key={grupo.servicio.id} className="bg-gray-50/50 rounded-xl p-4 border border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-md font-bold text-[#1B5FAE] flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-[#29ABE2]"></div>
                      {grupo.servicio.nombre}
                    </h3>
                    <button 
                      onClick={() => llamarSiguiente(grupo.servicio.id)}
                      disabled={grupo.turnos.length === 0 || !moduloId}
                      className="text-sm bg-[#E8F6FD] hover:bg-[#1B5FAE] text-[#1B5FAE] hover:text-white border border-[#1B5FAE]/20 px-4 py-1.5 rounded-lg font-semibold transition-all disabled:opacity-40 disabled:hover:bg-[#E8F6FD] disabled:hover:text-[#1B5FAE]"
                    >
                      Llamar Siguiente
                    </button>
                  </div>
                  <div className="grid gap-2">
                    {grupo.turnos.map((t) => (
                      <div
                        key={t.id}
                        className={`flex items-center justify-between bg-white rounded-lg p-3 shadow-sm border-l-4 ${
                          currentTurn?.id === t.id ? 'border-l-[#29ABE2] ring-1 ring-[#29ABE2]/30' : 'border-l-[#1B5FAE] border border-gray-100'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <span className="font-bold text-lg text-[#0D2E5A] w-16">{t.codigo}</span>
                          <div className="flex flex-col">
                            <span className="font-medium text-gray-800">{t.nombre || 'Paciente'}</span>
                            <span className="text-[#6B7A8D] text-xs">ID: {t.cedula.slice(0, -4).replace(/./g, '*') + t.cedula.slice(-4)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Current Turn + Actions */}
        <div className="w-full lg:w-96 flex flex-col gap-6">
          {/* Current Turn */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center flex-1 flex flex-col items-center justify-center min-h-[250px] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#1B5FAE] to-[#29ABE2]"></div>
            {currentTurn ? (
              <div className="flex flex-col items-center w-full">
                <span className="bg-[#E8F6FD] text-[#1B5FAE] text-xs font-bold px-3 py-1 rounded-full mb-4 uppercase tracking-wider">Atención Actual</span>
                <p className="text-6xl font-black text-[#29ABE2] mb-2 tracking-tight">{currentTurn.codigo}</p>
                <p className="text-[#0D2E5A] font-bold text-xl mb-4">{currentTurn.nombre || 'Paciente'}</p>
                
                <div className="w-full bg-gray-50 rounded-xl p-4 mt-2">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[#6B7A8D] text-sm font-medium">Documento</span>
                    <span className="text-gray-800 font-semibold">{currentTurn.cedula}</span>
                  </div>
                  {currentTurn.modulo && (
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[#6B7A8D] text-sm font-medium">Módulo</span>
                      <span className="text-gray-800 font-semibold">{currentTurn.modulo.nombre}</span>
                    </div>
                  )}
                  {currentTurn.servicio && (
                    <div className="flex justify-between items-center">
                      <span className="text-[#6B7A8D] text-sm font-medium">Servicio</span>
                      <span className="text-[#1B5FAE] font-semibold text-right max-w-[60%] truncate" title={currentTurn.servicio.nombre}>
                        {currentTurn.servicio.nombre}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center text-[#6B7A8D]">
                <svg className="w-16 h-16 text-gray-200 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                </svg>
                <p className="text-lg font-medium">Módulo Disponible</p>
                <p className="text-sm mt-1">Llame al siguiente paciente para comenzar</p>
              </div>
            )}
          </div>

          {/* Acciones */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col gap-3">
            <h3 className="text-sm font-bold text-[#0D2E5A] mb-1 uppercase tracking-wider">Acciones</h3>
            <button
              onClick={() => llamarSiguiente()}
              disabled={totalWaiting === 0 || !moduloId}
              className="w-full bg-[#1B5FAE] hover:bg-[#0D2E5A] text-white disabled:opacity-40 rounded-xl py-4 text-lg font-bold transition-all shadow-md flex items-center justify-center gap-2"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"></path></svg>
              Llamar Siguiente
            </button>
            <div className="grid grid-cols-3 gap-3 mt-1">
              <button
                onClick={reLlamar}
                disabled={!currentTurn}
                className="bg-amber-500 hover:bg-amber-600 text-white disabled:opacity-40 rounded-xl py-3 font-semibold text-sm transition-all shadow-sm flex flex-col items-center justify-center gap-1"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                Re-llamar
              </button>
              <button
                onClick={marcarAusente}
                disabled={!currentTurn}
                className="bg-red-500 hover:bg-red-600 text-white disabled:opacity-40 rounded-xl py-3 font-semibold text-sm transition-all shadow-sm flex flex-col items-center justify-center gap-1"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                Ausente
              </button>
              <button
                onClick={finalizar}
                disabled={!currentTurn}
                className="bg-emerald-500 hover:bg-emerald-600 text-white disabled:opacity-40 rounded-xl py-3 font-semibold text-sm transition-all shadow-sm flex flex-col items-center justify-center gap-1"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                Finalizar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
