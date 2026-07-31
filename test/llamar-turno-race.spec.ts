import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException } from '@nestjs/common';
import { PrismaService } from '../src/prisma/prisma.service';
import { TurnosService } from '../src/turnos/turnos.service';
import { PrismaModule } from '../src/prisma/prisma.module';

describe('TurnosService — llamarTurno race condition', () => {
  let service: TurnosService;
  let prisma: PrismaService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [PrismaModule],
      providers: [TurnosService],
    }).compile();

    service = module.get<TurnosService>(TurnosService);
    prisma = module.get<PrismaService>(PrismaService);

    await prisma.$connect();

    // Seed: crear sede, servicio, modulo y un turno en waiting
    await prisma.sede.upsert({
      where: { id: 999 },
      update: {},
      create: { id: 999, nombre: 'Sede Test Race', direccion: 'Test', activa: true },
    });
    await prisma.servicio.upsert({
      where: { id: 999 },
      update: {},
      create: { id: 999, sedeId: 999, nombre: 'Race Test', prefijo: 'RACE' },
    });
    await prisma.modulo.upsert({
      where: { id: 999 },
      update: {},
      create: { id: 999, sedeId: 999, nombre: 'Módulo Race' },
    });
  });

  beforeEach(async () => {
    // Limpiar turnos previos de prueba
    await prisma.turnoEvento.deleteMany({ where: { turno: { servicioId: 999 } } });
    await prisma.turno.deleteMany({ where: { servicioId: 999 } });

    // Crear un turno en estado 'waiting'
    await prisma.turno.create({
      data: {
        id: 9999,
        sedeId: 999,
        servicioId: 999,
        codigo: 'RACE-001',
        cedula: '12345678',
        status: 'waiting',
      },
    });
  });

  afterAll(async () => {
    await prisma.turnoEvento.deleteMany({ where: { turno: { servicioId: 999 } } });
    await prisma.turno.deleteMany({ where: { servicioId: 999 } });
    await prisma.modulo.deleteMany({ where: { sedeId: 999 } });
    await prisma.servicio.deleteMany({ where: { sedeId: 999 } });
    await prisma.sala.deleteMany({ where: { sedeId: 999 } });
    await prisma.sede.deleteMany({ where: { id: 999 } });
    await prisma.$disconnect();
  });

  it('solo una de dos llamadas simultáneas debe tener éxito', async () => {
    const llamada1 = service.llamarTurno(9999, 999, 1).catch((e) => e);
    const llamada2 = service.llamarTurno(9999, 999, 1).catch((e) => e);

    const [r1, r2] = await Promise.all([llamada1, llamada2]);

    const exitoso = [r1, r2].filter((r) => !(r instanceof Error) && r?.id === 9999);
    const fallido = [r1, r2].filter((r) => r instanceof ConflictException);

    expect(exitoso).toHaveLength(1);
    expect(fallido).toHaveLength(1);

    // El turno debe quedar en 'called' (no 'waiting')
    const turno = await prisma.turno.findUnique({ where: { id: 9999 } });
    expect(turno?.status).toBe('called');

    // Debe haber exactamente 1 evento 'llamado'
    const eventos = await prisma.turnoEvento.findMany({
      where: { turnoId: 9999, tipoEvento: 'llamado' },
    });
    expect(eventos).toHaveLength(1);
  });
});
