import { describe, beforeAll, afterAll, it, expect } from 'vitest';
import { prisma, connectDb, disconnectDb, cleanDb, apiAuth, loginAs } from './helpers';

describe('Aislamiento multi-tenant', () => {
  let sedeAId: number, sedeBId: number;
  let tokenA: string;

  beforeAll(async () => {
    await connectDb();
    await cleanDb();

    const sedeA = await prisma.sede.create({ data: { nombre: 'Sede A', direccion: 'Dir A', activa: true } });
    sedeAId = sedeA.id;
    const sedeB = await prisma.sede.create({ data: { nombre: 'Sede B', direccion: 'Dir B', activa: true } });
    sedeBId = sedeB.id;

    await prisma.usuario.create({
      data: { sedeId: sedeAId, nombre: 'User A', email: 'usera@test.com', passwordHash: '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', rol: 'profesional' },
    });
    await prisma.servicio.create({ data: { sedeId: sedeBId, nombre: 'Srv B', prefijo: 'SRVB' } });
    await prisma.modulo.create({ data: { sedeId: sedeBId, nombre: 'Mod B' } });

    tokenA = await loginAs('usera@test.com', '123456');
  });

  afterAll(async () => {
    await cleanDb();
    await disconnectDb();
  });

  it('usuario de sede A no puede acceder a colas de sede B', async () => {
    const res = await apiAuth(`/sedes/${sedeBId}/colas`, tokenA);
    const datos = await res.json();

    expect([403, 404]).toContain(res.status);
  });
});
