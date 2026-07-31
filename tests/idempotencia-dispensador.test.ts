import { describe, beforeAll, afterAll, it, expect } from 'vitest';
import { prisma, connectDb, disconnectDb, cleanDb, api } from './helpers';

describe('Idempotencia — dispensador', () => {
  let sedeId: number, servicioId: number;

  beforeAll(async () => {
    await connectDb();
    await cleanDb();

    const sede = await prisma.sede.create({ data: { nombre: 'Sede Test Idem', direccion: 'Test', activa: true } });
    sedeId = sede.id;
    const servicio = await prisma.servicio.create({ data: { sedeId, nombre: 'Idem Test', prefijo: 'IDM' } });
    servicioId = servicio.id;
    await prisma.contadorTurno.create({ data: { servicioId, fecha: new Date(new Date().setUTCHours(0, 0, 0, 0)), ultimoNumero: 0 } });
  });

  afterAll(async () => {
    await cleanDb();
    await disconnectDb();
  });

  it('dos POST /turnos con misma cédula y servicio devuelven el mismo turno (sin duplicar)', async () => {
    const payload = { servicioId, cedula: '22222222' };

    const r1 = await (await api('/turnos', { method: 'POST', body: JSON.stringify(payload) })).json();
    const r2 = await (await api('/turnos', { method: 'POST', body: JSON.stringify(payload) })).json();

    expect(r1.id).toBeDefined();
    expect(r2.id).toBe(r1.id);

    const count = await prisma.turno.count({
      where: { cedula: '22222222', servicioId },
    });
    expect(count).toBe(1);
  });
});
