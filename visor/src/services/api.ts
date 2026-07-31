const BASE = '/api';

async function request<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export interface VisorInfo {
  id: number;
  nombre: string;
  configMultimedia: Record<string, unknown> | null;
  mostrarCedula: boolean;
  sala: { id: number; sedeId: number; nombre: string };
  playlists: PlaylistItem[];
}

export interface PlaylistItem {
  id: number;
  tipo: 'imagen' | 'video';
  url: string;
  orden: number;
  activo: boolean;
}

export interface Turno {
  id: number;
  codigo: string;
  cedula: string;
  nombre?: string;
  status: string;
  moduloId: number | null;
  createdAt: string;
  servicio: { id: number; nombre: string; prefijo: string };
  modulo: { id: number; nombre: string } | null;
}

export interface EstadoActual {
  visor: { id: number; nombre: string; configMultimedia: Record<string, unknown> | null; mostrarCedula: boolean };
  turnoActual: Turno | null;
  ultimosLlamados: Turno[];
}

export interface SedeInfo { id: number; nombre: string }
export interface SalaInfo { id: number; nombre: string; sedeId: number }
export interface VisorSimple { id: number; nombre: string }

export function getSedes() {
  return request<SedeInfo[]>('/public/sedes');
}

export function getSalas(sedeId: number) {
  return request<SalaInfo[]>(`/public/salas?sedeId=${sedeId}`);
}

export function getVisores(salaId: number) {
  return request<VisorSimple[]>(`/public/salas/${salaId}/visores`);
}

export function getVisor(id: number) {
  return request<VisorInfo>(`/public/visores/${id}`);
}

export function getEstadoActual(visorId: number) {
  return request<EstadoActual>(`/public/visores/${visorId}/estado-actual`);
}
