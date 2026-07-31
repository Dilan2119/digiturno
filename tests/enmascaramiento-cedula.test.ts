import { describe, beforeAll, afterAll, it, expect } from 'vitest';
import { prisma, connectDb, disconnectDb, cleanDb, api, apiAuth, loginAs, createTurno, connectWs } from './helpers';

describe('Enmascaramiento de cédula', () => {
  let sedeId: number, servicioId: number, moduloId: number, salaId: number, visorId: number;
  let adminToken: string;

  beforeAll(async () => {
    await connectDb();
    await cleanDb();

    const sede = await prisma.sede.create({ data: { nombre: 'Sede Test Mask', direccion: 'Test', activa: true } });
    sedeId = sede.id;
    const servicio = await prisma.servicio.create({ data: { sedeId, nombre: 'Mask Test', prefijo: 'MSK' } });
    servicioId = servicio.id;
    const modulo = await prisma.modulo.create({ data: { sedeId, nombre: 'Módulo Mask' } });
    moduloId = modulo.id;
    const sala = await prisma.sala.create({ data: { sedeId, nombre: 'Sala Mask' } });
    salaId = sala.id;
    const visor = await prisma.visor.create({ data: { salaId, nombre: 'Visor Mask', mostrarCedula: false } });
    visorId = visor.id;

    await prisma.usuario.create({
      data: { sedeId, nombre: 'Admin Mask', email: 'mask@test.com', passwordHash: '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', rol: 'admin_central' },
    });
    await prisma.contadorTurno.create({ data: { servicioId, fecha: new Date(new Date().setUTCHours(0, 0, 0, 0)), ultimoNumero: 0 } });

    adminToken = await loginAs('mask@test.com');
  });

  afterAll(async () => {
    await cleanDb();
    await disconnectDb();
  });

  it('payload de turno llamado no incluye cédula cuando mostrarCedula=false', async () => {
    const turno: any = await createTurno(servicioId, '55555555');

    const socket = await connectWs(salaId);
    const wsEvents: any[] = [];
    socket.on('turno-llamado', (data) => wsEvents.push(data));

    await apiAuth(`/turnos/${turno.id}/llamar`, adminToken, {
      method: 'POST',
      body: JSON.stringify({ moduloId }),
    });

    await new Promise(r => setTimeout(r, 500));

    socket.disconnect();

    const estadoRes = await (await api(`/visores/${visorId}/estado-actual`)).json();
    expect(estadoRes.turnoActual).toBeDefined();
    expect(estadoRes.turnoActual.cedula).toBeUndefined();

    for (const evt of wsEvents) {
      expect(evt.cedula).toBeUndefined();
    }
  });
});
