import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTurnoDto } from './dto/create-turno.dto';

export interface TurnoResult {
  success: boolean;
  turno?: any;
  message?: string;
}

@Injectable()
export class TurnosService {
  constructor(private prisma: PrismaService) {}

  async crear(dto: CreateTurnoDto) {
    const hoy = new Date();
    hoy.setUTCHours(0, 0, 0, 0);
    const manana = new Date(hoy);
    manana.setUTCDate(manana.getUTCDate() + 1);

    const servicio = await this.prisma.servicio.findUnique({
      where: { id: dto.servicioId },
      include: { sede: true },
    });
    if (!servicio) throw new ConflictException('Servicio no encontrado');

    const turnoActivo = await this.prisma.turno.findFirst({
      where: {
        cedula: dto.cedula,
        servicioId: dto.servicioId,
        status: { in: ['waiting', 'called', 'attending'] },
        createdAt: { gte: hoy, lt: manana },
      },
      include: { servicio: true },
    });

    if (turnoActivo) return turnoActivo;

    return this.prisma.$transaction(async (tx) => {
      let contador = await tx.contadorTurno.findUnique({
        where: {
          servicioId_fecha: { servicioId: dto.servicioId, fecha: hoy },
        },
      });

      if (!contador) {
        contador = await tx.contadorTurno.create({
          data: { servicioId: dto.servicioId, fecha: hoy, ultimoNumero: 0 },
        });
      }

      const nuevoNumero = contador.ultimoNumero + 1;

      await tx.contadorTurno.update({
        where: { id: contador.id },
        data: { ultimoNumero: nuevoNumero },
      });

      const codigo = `${servicio.prefijo}-${String(nuevoNumero).padStart(3, '0')}`;

      const turno = await tx.turno.create({
        data: {
          sedeId: servicio.sedeId,
          servicioId: dto.servicioId,
          codigo,
          cedula: dto.cedula,
          nombre: dto.nombre ?? null,
          status: 'waiting',
        },
        include: { servicio: true },
      });

      await tx.turnoEvento.create({
        data: {
          turnoId: turno.id,
          tipoEvento: 'creado',
        },
      });

      return turno;
    });
  }

  async colasPorSede(sedeId: number) {
    const turnos = await this.prisma.turno.findMany({
      where: { sedeId, status: 'waiting' },
      include: { servicio: true },
      orderBy: { createdAt: 'asc' },
    });

    const agrupado: Record<string, any> = {};
    for (const t of turnos) {
      const key = t.servicio.nombre;
      if (!agrupado[key]) {
        agrupado[key] = {
          servicio: { id: t.servicio.id, nombre: t.servicio.nombre, prefijo: t.servicio.prefijo },
          turnos: [],
        };
      }
      agrupado[key].turnos.push({
        id: t.id,
        codigo: t.codigo,
        cedula: t.cedula,
        nombre: t.nombre,
        status: t.status,
        createdAt: t.createdAt,
      });
    }

    return Object.values(agrupado);
  }

  async estadoActualVisor(visorId: number) {
    const visor = await this.prisma.visor.findUnique({
      where: { id: visorId },
      include: { sala: true },
    });
    if (!visor) throw new ConflictException('Visor no encontrado');

    const ultimosLlamados = await this.prisma.turno.findMany({
      where: {
        sedeId: visor.sala.sedeId,
        status: { in: ['called', 'attending'] },
      },
      include: { servicio: true, modulo: true },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    const turnoActual = ultimosLlamados.length > 0 ? ultimosLlamados[0] : null;

    return {
      visor: { id: visor.id, nombre: visor.nombre, configMultimedia: visor.configMultimedia, mostrarCedula: visor.mostrarCedula },
      turnoActual,
      ultimosLlamados,
    };
  }

  async llamarTurno(turnoId: number, moduloId: number, usuarioId: number) {
    const result = await this.prisma.turno.updateMany({
      where: { id: turnoId, status: 'waiting' },
      data: { status: 'called', moduloId },
    });

    if (result.count === 0) {
      throw new ConflictException('El turno no está en espera o ya fue llamado');
    }

    await this.prisma.turnoEvento.create({
      data: { turnoId, tipoEvento: 'llamado', usuarioId },
    });

    return this.prisma.turno.findUnique({
      where: { id: turnoId },
      include: { servicio: true, modulo: true },
    });
  }

  async reLlamarTurno(turnoId: number, usuarioId: number) {
    const turno = await this.prisma.turno.findUnique({
      where: { id: turnoId },
      include: { servicio: true, modulo: true },
    });

    if (!turno || turno.status !== 'called') {
      throw new ConflictException('El turno debe estar en estado "llamado"');
    }

    await this.prisma.turnoEvento.create({
      data: { turnoId, tipoEvento: 're_llamado', usuarioId },
    });

    return turno;
  }

  async marcarAusente(turnoId: number, usuarioId: number) {
    const result = await this.prisma.turno.updateMany({
      where: { id: turnoId, status: { in: ['called', 'attending'] } },
      data: { status: 'absent' },
    });

    if (result.count === 0) {
      throw new ConflictException('El turno no está en llamado o atención');
    }

    await this.prisma.turnoEvento.create({
      data: { turnoId, tipoEvento: 'ausente', usuarioId },
    });

    return this.prisma.turno.findUnique({
      where: { id: turnoId },
      include: { servicio: true, modulo: true },
    });
  }

  async finalizarAtencion(turnoId: number, usuarioId: number) {
    const result = await this.prisma.turno.updateMany({
      where: { id: turnoId, status: 'attending' },
      data: { status: 'finished' },
    });

    if (result.count === 0) {
      throw new ConflictException('El turno no está en atención');
    }

    await this.prisma.turnoEvento.create({
      data: { turnoId, tipoEvento: 'finalizado', usuarioId },
    });

    return this.prisma.turno.findUnique({
      where: { id: turnoId },
      include: { servicio: true, modulo: true },
    });
  }
}
