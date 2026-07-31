const BASE = '/api';

let accessToken: string | null = null;

export function setToken(token: string | null) {
  accessToken = token;
}

export function getToken() {
  return accessToken;
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`;
  const res = await fetch(`${BASE}${url}`, { headers, ...init });
  if (res.status === 401) throw new Error('Sesión expirada');
  if (!res.ok) {
    const body = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(body.message || `Error ${res.status}`);
  }
  return res.json();
}

export interface LoginRes {
  accessToken: string;
  refreshToken: string;
}

export function login(email: string, password: string) {
  return request<LoginRes>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export interface Servicio {
  id: number; nombre: string; prefijo: string;
}

export interface Turno {
  id: number; codigo: string; cedula: string; nombre?: string; status: string;
  createdAt: string; sedeId: number; servicioId: number;
  servicio?: Servicio; modulo?: { id: number; nombre: string } | null;
}

export interface ColaGrupo {
  servicio: Servicio;
  turnos: Turno[];
}

export interface Sala {
  id: number; sedeId: number; nombre: string;
}

export function getColas(sedeId: number) {
  return request<ColaGrupo[]>('/sedes/' + sedeId + '/colas');
}

export function getSalas(sedeId: number) {
  return request<Sala[]>('/public/salas?sedeId=' + sedeId);
}

export function getServicios(sedeId: number) {
  return request<Servicio[]>('/public/servicios?sedeId=' + sedeId);
}

export interface Modulo { id: number; nombre: string }

export function getModulos(sedeId: number) {
  return request<Modulo[]>('/public/modulos?sedeId=' + sedeId);
}

export function getTurno(id: number) {
  return request<Turno>('/turnos/' + id);
}
