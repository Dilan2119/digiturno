import { io, Socket } from 'socket.io-client';

const WS_BASE = (import.meta.env.VITE_WS_URL as string) || '';

let socket: Socket | null = null;

export function connectSocket(token: string, salaId: number) {
  if (socket?.connected) socket.disconnect();

  socket = io(WS_BASE + '/visor', {
    auth: { token },
    query: { salaId: String(salaId) },
    transports: ['websocket', 'polling'],
  });

  return socket;
}

export function getSocket() {
  return socket;
}

export function disconnectSocket() {
  if (socket) { socket.disconnect(); socket = null; }
}
