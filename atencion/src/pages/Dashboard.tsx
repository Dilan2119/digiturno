import { useEffect, useState, useCallback, useRef } from 'react';
import { Socket } from 'socket.io-client';
import { ColaGrupo, Turno, Sala, Modulo, getColas, getSalas, getModulos, Servicio } from '../services/api';

interface Props {
  socket: Socket | null;
  sedeId: number;
  onLogout: () => void;
}

export default function Dashboard({ socket, sedeId, onLogout }: Props) {
  const [salas, setSalas] = useState<Sala[]>([]);
  const [salaId, setSalaId] = useState<number | null>(null);
  const [queue, setQueue] = useState<ColaGrupo[]>([]);
  const [currentTurn, setCurrentTurn] = useState<Turno | null>(null);
  const [modulos, setModulos] = useState<Modulo[]>([]);
  const [moduloId, setModuloId] = useState<number | null>(null);
  const [wsStatus, setWsStatus] = useState<'connected' | 'disconnected' | 'connecting'>('disconnected');
  const llamandoRef = useRef(false);

  useEffect(() => {
    getSalas(sedeId).then((s) => {
      setSalas(s);
      if (s.length > 0) setSalaId(s[0].id);
    });
    getModulos(sedeId).then(setModulos).catch(() => {});
  }, [sedeId]);

  useEffect(() => {
    if (!salaId) return;
    getColas(sedeId).then(setQueue).catch(() => {});
  }, [sedeId, salaId]);

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
        const grupo = prev.find((g) => g.servicio.id === t.servicio?.id);
        if (grupo) {
          return prev.map((g) =>
            g.servicio.id === t.servicio?.id
              ? { ...g, turnos: [...g.turnos, t] }
              : g,
          );
        }
        return [...prev, { servicio: t.servicio!, turnos: [t] }];
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

  const llamarSiguiente = () => {
    if (!moduloId) { alert('Seleccione un módulo'); return; }
    const first = queue.flatMap((g) => g.turnos)[0];
    if (!first) { alert('No hay turnos en espera'); return; }
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
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="bg-slate-800 px-4 py-3 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <span className="text-blue-300 font-bold">Digiturno</span>
          <select
            value={salaId ?? ''}
            onChange={(e) => setSalaId((e.target.value && Number(e.target.value)) || null)}
            className="bg-slate-700 rounded-lg px-3 py-1.5 text-sm text-white"
          >
            {salas.map((s) => <option key={s.id} value={s.id}>{s.nombre}</option>)}
          </select>
          <select
            value={moduloId ?? ''}
            onChange={(e) => setModuloId((e.target.value && Number(e.target.value)) || null)}
            className="bg-slate-700 rounded-lg px-3 py-1.5 text-sm text-white"
          >
            <option value="">Módulo</option>
            {modulos.map((m) => <option key={m.id} value={m.id}>{m.nombre}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-sm">
            <span className={`w-2.5 h-2.5 rounded-full ${
              wsStatus === 'connected' ? 'bg-green-400' : 'bg-red-400'
            }`} />
            <span className="text-slate-400">{wsStatus === 'connected' ? 'En vivo' : 'Desconectado'}</span>
          </div>
          <button onClick={onLogout} className="text-sm text-slate-400 hover:text-white">Salir</button>
        </div>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row gap-4 p-4 overflow-auto">
        {/* Left: Queue */}
        <div className="flex-1 bg-slate-800/50 rounded-2xl p-4 overflow-auto">
          <h2 className="text-lg font-semibold text-slate-300 mb-3">
            Cola de Espera <span className="text-sm text-slate-500">({totalWaiting})</span>
          </h2>
          {queue.length === 0 ? (
            <p className="text-slate-600 text-center py-8">Sin turnos en espera</p>
          ) : (
            queue.map((grupo) => (
              <div key={grupo.servicio.id} className="mb-4">
                <h3 className="text-sm font-medium text-slate-400 mb-1.5">{grupo.servicio.nombre}</h3>
                <div className="space-y-1">
                  {grupo.turnos.map((t) => (
                    <div
                      key={t.id}
                      className={`flex items-center justify-between bg-slate-800 rounded-xl px-4 py-2.5 text-sm ${
                        currentTurn?.id === t.id ? 'ring-2 ring-blue-500' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-bold text-blue-300">{t.codigo}</span>
                        <span className="text-slate-400">{t.nombre || '---'}</span>
                      </div>
                      <span className="text-slate-500 text-xs">{t.cedula.slice(0, -4).replace(/./g, '*') + t.cedula.slice(-4)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Right: Current Turn + Actions */}
        <div className="w-full lg:w-80 flex flex-col gap-4">
          {/* Current Turn */}
          <div className="bg-slate-800 rounded-2xl p-6 text-center flex-1 flex flex-col items-center justify-center min-h-[200px]">
            {currentTurn ? (
              <>
                <p className="text-slate-400 text-sm mb-1">Atención Actual</p>
                <p className="text-4xl font-bold font-mono text-blue-400 mb-1">{currentTurn.codigo}</p>
                <p className="text-slate-300 text-lg">{currentTurn.cedula}</p>
                {currentTurn.modulo && <p className="text-slate-500 text-sm mt-1">Módulo {currentTurn.modulo.nombre}</p>}
                {currentTurn.servicio && <p className="text-slate-500 text-xs mt-1">{currentTurn.servicio.nombre}</p>}
              </>
            ) : (
              <p className="text-slate-600">Sin atención activa</p>
            )}
          </div>

          {/* Acciones */}
          <div className="space-y-2">
            <button
              onClick={llamarSiguiente}
              disabled={totalWaiting === 0 || !moduloId}
              className="w-full bg-blue-700 hover:bg-blue-600 disabled:opacity-40 rounded-xl py-4 text-lg font-bold transition-colors"
            >
              📞 Llamar Siguiente
            </button>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={reLlamar}
                disabled={!currentTurn}
                className="bg-amber-700 hover:bg-amber-600 disabled:opacity-40 rounded-xl py-3 font-semibold text-sm transition-colors"
              >
                🔄 Re-llamar
              </button>
              <button
                onClick={marcarAusente}
                disabled={!currentTurn}
                className="bg-red-800 hover:bg-red-700 disabled:opacity-40 rounded-xl py-3 font-semibold text-sm transition-colors"
              >
                ❌ Ausente
              </button>
              <button
                onClick={finalizar}
                disabled={!currentTurn}
                className="bg-green-800 hover:bg-green-700 disabled:opacity-40 rounded-xl py-3 font-semibold text-sm transition-colors"
              >
                ✅ Finalizar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
