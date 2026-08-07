const BASE = '/api';

let accessToken: string | null = null;

export function setToken(t: string | null) { accessToken = t; }
export function getToken() { return accessToken; }

export function getJwtPayload(token: string) {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(decodeURIComponent(window.atob(base64).split('').map(c =>
      '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')));
  } catch { return null; }
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`;
  const res = await fetch(`${BASE}${url}`, { headers, ...init });
  if (!res.ok) {
    const body = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(body.message || `Error ${res.status}`);
  }
  return res.json();
}

export interface LoginRes { accessToken: string; refreshToken: string; }

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

export function login(email: string, password: string) {
  return request<LoginRes>('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
}

export function getSede(id: number) {
  return request<Sede>(`/public/sedes/${id}`);
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
