import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller('public')
export class PublicController {
  constructor(private prisma: PrismaService) {}

  @Get('sedes')
  async listSedes() {
    return this.prisma.sede.findMany({ select: { id: true, nombre: true } });
  }

  @Get('sedes/:id')
  async getSede(@Param('id', ParseIntPipe) id: number) {
    return this.prisma.sede.findUnique({ where: { id }, select: { id: true, nombre: true } });
  }

  @Get('salas')
  async listSalas(@Query('sedeId') sedeId?: string) {
    const where = sedeId ? { sedeId: parseInt(sedeId, 10) } : {};
    return this.prisma.sala.findMany({ where, select: { id: true, nombre: true, sedeId: true } });
  }

  @Get('salas/:salaId/visores')
  async listVisores(@Param('salaId', ParseIntPipe) salaId: number) {
    return this.prisma.visor.findMany({
      where: { salaId },
      select: { id: true, nombre: true },
    });
  }

  @Get('modulos')
  async listModulos(@Query('sedeId') sedeId?: string) {
    const where = sedeId ? { sedeId: parseInt(sedeId, 10) } : {};
    return this.prisma.modulo.findMany({ where, select: { id: true, nombre: true, sedeId: true } });
  }

  @Get('servicios')
  async listServicios(@Query('sedeId') sedeId?: string) {
    const where = sedeId ? { sedeId: parseInt(sedeId, 10) } : {};
    return this.prisma.servicio.findMany({ where, select: { id: true, nombre: true, prefijo: true, sedeId: true } });
  }

  @Get('visores/:id')
  async getVisor(@Param('id', ParseIntPipe) id: number) {
    return this.prisma.visor.findUnique({
      where: { id },
      include: {
        sala: { include: { servicios: { select: { id: true } } } },
        playlists: { where: { activo: true }, orderBy: { orden: 'asc' } },
      },
    });
  }

  @Get('visores/:id/estado-actual')
  async getEstadoActual(@Param('id', ParseIntPipe) id: number) {
    const visor = await this.prisma.visor.findUnique({
      where: { id },
      include: { sala: { include: { servicios: { select: { id: true } } } } },
    });
    if (!visor) throw new Error('Visor no encontrado');

    const validServices = visor.sala.servicios.length > 0 ? visor.sala.servicios.map(s => s.id) : null;
    const whereClause: any = {
      sedeId: visor.sala.sedeId,
      status: { in: ['called', 'attending'] },
    };
    if (validServices) {
      whereClause.servicioId = { in: validServices };
    }

    const ultimosLlamados = await this.prisma.turno.findMany({
      where: whereClause,
      include: { servicio: true, modulo: true },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    return {
      visor: { id: visor.id, nombre: visor.nombre, configMultimedia: visor.configMultimedia, mostrarCedula: visor.mostrarCedula },
      turnoActual: ultimosLlamados[0] ?? null,
      ultimosLlamados,
    };
  }
}
