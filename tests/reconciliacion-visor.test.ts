import { describe, beforeAll, afterAll, it, expect } from 'vitest';
import { prisma, connectDb, disconnectDb, cleanDb, api, apiAuth, loginAs, createTurno } from './helpers';

describe('Reconciliación — visor obtiene estado actual', () => {
  let sedeId: number, servicioId: number, moduloId: number, salaId: number, visorId: number;
  let adminToken: string;
  let turnoCodigo: string;

  beforeAll(async () => {
    await connectDb();
    await cleanDb();

    const sede = await prisma.sede.create({ data: { nombre: 'Sede Test Recon', direccion: 'Test', activa: true } });
    sedeId = sede.id;
    const servicio = await prisma.servicio.create({ data: { sedeId, nombre: 'Recon Test', prefijo: 'RCN' } });
    servicioId = servicio.id;
    const modulo = await prisma.modulo.create({ data: { sedeId, nombre: 'Módulo Recon' } });
    moduloId = modulo.id;
    const sala = await prisma.sala.create({ data: { sedeId, nombre: 'Sala Recon' } });
    salaId = sala.id;
    const visor = await prisma.visor.create({ data: { salaId, nombre: 'Visor Recon', mostrarCedula: true } });
    visorId = visor.id;

    const admin = await prisma.usuario.create({
      data: { sedeId, nombre: 'Admin Recon', email: 'recon@test.com', passwordHash: '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', rol: 'admin_central' },
    });
    await prisma.contadorTurno.create({ data: { servicioId, fecha: new Date(new Date().setUTCHours(0, 0, 0, 0)), ultimoNumero: 0 } });

    adminToken = await loginAs('recon@test.com');
  });

  afterAll(async () => {
    await cleanDb();
    await disconnectDb();
  });

  it('turno llamado sin WS conectado aparece en estado-actual del visor', async () => {
    const turno: any = await createTurno(servicioId, '44444444');
    turnoCodigo = turno.codigo;

    const llamarRes = await apiAuth(`/turnos/${turno.id}/llamar`, adminToken, {
      method: 'POST',
      body: JSON.stringify({ moduloId }),
    });
    expect(llamarRes.status).toBe(200);

    const res = await (await api(`/visores/${visorId}/estado-actual`)).json();
    expect(res.turnoActual).toBeDefined();
    expect(res.turnoActual.codigo).toBe(turnoCodigo);
    expect(res.turnoActual.status).toBe('called');
  });
});
