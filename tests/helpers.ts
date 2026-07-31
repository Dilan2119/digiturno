import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { io as SocketIO, Socket } from 'socket.io-client';

const DATABASE_URL = process.env.TEST_DATABASE_URL || 'postgresql://postgres:postgres@localhost:5433/digiturno_test?schema=public';
const API_BASE = process.env.TEST_API_URL || 'http://localhost:3000/api';

const pool = new Pool({ connectionString: DATABASE_URL });
const adapter = new PrismaPg(pool);
export const prisma = new PrismaClient({ adapter });

export async function connectDb() {
  await prisma.$connect();
}

export async function disconnectDb() {
  await prisma.$disconnect();
}

export async function cleanDb() {
  const tablenames = await prisma.$queryRaw<Array<{ tablename: string }>>`
    SELECT tablename FROM pg_tables WHERE schemaname='public'
  `;
  for (const { tablename } of tablenames) {
    if (tablename !== '_prisma_migrations') {
      await prisma.$executeRawUnsafe(`TRUNCATE TABLE "${tablename}" CASCADE;`);
    }
  }
}

export function api(path: string, init?: RequestInit) {
  return fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });
}

export function apiAuth(path: string, token: string, init?: RequestInit) {
  return fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    ...init,
  });
}

export async function loginAs(email: string, password: string = '123456'): Promise<string> {
  const res = await api('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error(`Login failed: ${await res.text()}`);
  const data: any = await res.json();
  return data.accessToken;
}

export async function createTurno(servicioId: number, cedula: string = '12345678') {
  const res = await api('/turnos', {
    method: 'POST',
    body: JSON.stringify({ servicioId, cedula }),
  });
  return res.json() as any;
}

export async function llamarTurno(turnoId: number, moduloId: number, token: string) {
  return apiAuth(`/turnos/${turnoId}/llamar`, token, {
    method: 'POST',
    body: JSON.stringify({ moduloId }),
  });
}

export function connectWs(salaId: number, token?: string): Promise<Socket> {
  return new Promise((resolve, reject) => {
    const socket = SocketIO('http://localhost:3000/visor', {
      transports: ['websocket'],
      query: { salaId: String(salaId), token: token || '' },
      auth: token ? { token } : undefined,
      forceNew: true,
    });
    socket.on('connect', () => resolve(socket));
    socket.on('connect_error', (err) => reject(err));
    setTimeout(() => reject(new Error('WS connection timeout')), 5000);
  });
}
