import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateServicioDto } from './dto/create-servicio.dto';
import { UpdateServicioDto } from './dto/update-servicio.dto';

@Injectable()
export class ServiciosService {
  constructor(private prisma: PrismaService) {}

  create(dto: CreateServicioDto) {
    return this.prisma.servicio.create({ data: dto });
  }

  findAll(sedeId?: number) {
    const where = sedeId ? { sedeId } : {};
    return this.prisma.servicio.findMany({ where, orderBy: { nombre: 'asc' } });
  }

  async findOne(id: number) {
    const servicio = await this.prisma.servicio.findUnique({ where: { id } });
    if (!servicio) throw new NotFoundException('Servicio no encontrado');
    return servicio;
  }

  async update(id: number, dto: UpdateServicioDto) {
    await this.findOne(id);
    return this.prisma.servicio.update({ where: { id }, data: dto });
  }

  async remove(id: number) {
    await this.findOne(id);
    const turnos = await this.prisma.turno.count({ where: { servicioId: id } });
    if (turnos > 0) throw new ConflictException('No se puede eliminar: tiene turnos asociados');
    await this.prisma.contadorTurno.deleteMany({ where: { servicioId: id } });
    return this.prisma.servicio.delete({ where: { id } });
  }
}
