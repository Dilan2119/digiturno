import { describe, beforeAll, afterAll, it, expect } from 'vitest';
import { prisma, connectDb, disconnectDb, cleanDb, api, loginAs, createTurno, llamarTurno } from './helpers';

describe('Condición de carrera — llamarTurno', () => {
  let sedeId: number, servicioId: number, moduloId: number, turnoId: number;
  let adminToken: string;

  beforeAll(async () => {
    await connectDb();
    await cleanDb();

    const sede = await prisma.sede.create({ data: { nombre: 'Sede Test Carrera', direccion: 'Test', activa: true } });
    sedeId = sede.id;
    const servicio = await prisma.servicio.create({ data: { sedeId, nombre: 'Carrera Test', prefijo: 'CRR' } });
    servicioId = servicio.id;
    const modulo = await prisma.modulo.create({ data: { sedeId, nombre: 'Módulo Carrera' } });
    moduloId = modulo.id;
    const admin = await prisma.usuario.create({
      data: { sedeId, nombre: 'Admin Carrera', email: 'carrera@test.com', passwordHash: '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', rol: 'admin_central' },
    });
    await prisma.contadorTurno.create({ data: { servicioId, fecha: new Date(new Date().setUTCHours(0, 0, 0, 0)), ultimoNumero: 0 } });
    await prisma.turno.create({ data: { sedeId, servicioId, codigo: 'CRR-001', cedula: '11111111', status: 'waiting' } });
    turnoId = (await prisma.turno.findFirst({ where: { codigo: 'CRR-001' } }))!.id;

    adminToken = await loginAs('carrera@test.com');
  });

  afterAll(async () => {
    await cleanDb();
    await disconnectDb();
  });

  it('solo 1 de 5 llamadas simultáneas debe tener éxito, las otras 4 deben fallar con 409', async () => {
    const promises = Array.from({ length: 5 }, () => llamarTurno(turnoId, moduloId, adminToken));
    const results = await Promise.all(promises);

    const success = results.filter(r => r.status === 200);
    const conflicts = results.filter(r => r.status === 409);

    expect(success).toHaveLength(1);
    expect(conflicts).toHaveLength(4);

    const eventos = await prisma.turnoEvento.findMany({
      where: { turnoId, tipoEvento: 'llamado' },
    });
    expect(eventos).toHaveLength(1);

    const turno = await prisma.turno.findUnique({ where: { id: turnoId } });
    expect(turno?.status).toBe('called');
  });
});
