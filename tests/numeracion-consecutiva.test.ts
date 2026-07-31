import { describe, beforeAll, afterAll, it, expect } from 'vitest';
import { prisma, connectDb, disconnectDb, cleanDb, api } from './helpers';

describe('Numeración consecutiva', () => {
  let sedeId: number, servicioId: number;

  beforeAll(async () => {
    await connectDb();
    await cleanDb();

    const sede = await prisma.sede.create({ data: { nombre: 'Sede Test Num', direccion: 'Test', activa: true } });
    sedeId = sede.id;
    const servicio = await prisma.servicio.create({ data: { sedeId, nombre: 'Num Test', prefijo: 'NUM' } });
    servicioId = servicio.id;
    await prisma.contadorTurno.create({ data: { servicioId, fecha: new Date(new Date().setUTCHours(0, 0, 0, 0)), ultimoNumero: 0 } });
  });

  afterAll(async () => {
    await cleanDb();
    await disconnectDb();
  });

  it('50 turnos concurrentes generan códigos únicos y consecutivos sin huecos', async () => {
    const promises = Array.from({ length: 50 }, (_, i) =>
      api('/turnos', { method: 'POST', body: JSON.stringify({ servicioId, cedula: `3333${String(i).padStart(3, '0')}` }) }).then(r => r.json()),
    );
    const results = await Promise.all(promises);

    const codigos: string[] = results.map((r: any) => r.codigo).sort();
    expect(codigos).toHaveLength(50);

    const numeros = codigos.map(c => parseInt(c.replace('NUM-', ''), 10));
    const unicos = new Set(numeros);
    expect(unicos.size).toBe(50);

    const min = Math.min(...numeros);
    const max = Math.max(...numeros);
    expect(max - min + 1).toBe(50);
  });
});
