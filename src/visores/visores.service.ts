import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVisorDto } from './dto/create-visor.dto';
import { UpdateVisorDto } from './dto/update-visor.dto';

@Injectable()
export class VisoresService {
  constructor(private prisma: PrismaService) {}

  create(dto: CreateVisorDto) {
    return this.prisma.visor.create({ data: dto });
  }

  findAll(salaId?: number, sedeId?: number) {
    const where: any = {};
    if (sedeId) {
      where.sala = { sedeId };
    } else if (salaId) {
      where.salaId = salaId;
    }
    return this.prisma.visor.findMany({ where, orderBy: { nombre: 'asc' }, include: { sala: true } });
  }

  async findOne(id: number) {
    const visor = await this.prisma.visor.findUnique({
      where: { id },
      include: { sala: true, playlists: { where: { activo: true }, orderBy: { orden: 'asc' } } },
    });
    if (!visor) throw new NotFoundException('Visor no encontrado');
    return visor;
  }

  async update(id: number, dto: UpdateVisorDto) {
    await this.findOne(id);
    return this.prisma.visor.update({ where: { id }, data: dto });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.visor.delete({ where: { id } });
  }
}
