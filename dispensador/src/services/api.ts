const BASE = '/api';

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${url}`, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(body.message || `Error ${res.status}`);
  }
  return res.json();
}

export interface Sede { id: number; nombre: string }

export interface Servicio {
  id: number;
  sedeId: number;
  nombre: string;
  prefijo: string;
}

export interface Turno {
  id: number;
  codigo: string;
  cedula: string;
  nombre?: string;
  status: string;
  createdAt: string;
  sedeId: number;
  servicioId: number;
}

export function getSedes() {
  return request<Sede[]>('/public/sedes');
}

export function getServicios(sedeId: number) {
  return request<Servicio[]>(`/sedes/${sedeId}/servicios`);
}

export function crearTurno(servicioId: number, cedula: string, nombre?: string) {
  return request<Turno>('/turnos', {
    method: 'POST',
    body: JSON.stringify({ servicioId, cedula, nombre }),
  });
}
