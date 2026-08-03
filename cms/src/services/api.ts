const BASE = '/api';
let accessToken: string | null = (() => {
  try { return localStorage.getItem('cms_token'); } catch { return null; }
})();

export function setToken(t: string | null) { accessToken = t; }
export function getToken() { return accessToken; }

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`;
  const res = await fetch(`${BASE}${url}`, { headers, ...init });
  if (res.status === 401) {
    // Limpiar token y notificar a la app para redirigir al login
    accessToken = null;
    localStorage.removeItem('cms_token');
    localStorage.removeItem('cms_user');
    window.dispatchEvent(new CustomEvent('auth:expired'));
    throw new Error('Sesión expirada. Por favor inicia sesión nuevamente.');
  }
  if (!res.ok) {
    const b = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(b.message || b.error || `Error ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export function login(email: string, password: string) {
  return request<{ accessToken: string; refreshToken: string }>('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
}

export function getList<T>(path: string) { return request<T[]>(path); }
export function getOne<T>(path: string) { return request<T>(path); }
export function create<T>(path: string, data: any) { return request<T>(path, { method: 'POST', body: JSON.stringify(data) }); }
export function update<T>(path: string, data: any) { return request<T>(path, { method: 'PATCH', body: JSON.stringify(data) }); }
export function remove(path: string) { return request(path, { method: 'DELETE' }); }

export interface Sede { id: number; nombre: string; direccion: string; activa: boolean; }
export interface Sala { id: number; sedeId: number; nombre: string; sede?: Sede; servicios?: Servicio[]; }
export interface Visor { id: number; salaId: number; nombre: string; configMultimedia?: any; mostrarCedula: boolean; sala?: Sala; }
export interface Servicio { id: number; sedeId: number; nombre: string; prefijo: string; }
export interface Modulo { id: number; sedeId: number; nombre: string; }
export interface Usuario { id: number; sedeId?: number; nombre: string; email: string; rol: string; servicios?: Servicio[]; }
export interface PlaylistItem { id: number; visorId: number; tipo: string; url: string; orden: number; activo: boolean; }

export function getMetricas(sedeId?: number) {
  const q = sedeId ? `?sedeId=${sedeId}` : '';
  return request<{ promedioEspera: { servicio: string; promedioSeg: number; cantidad: number }[]; atendidos: { profesional: string; fecha: string; total: number }[]; ausentes: number }>('/dashboard/metricas' + q);
}
