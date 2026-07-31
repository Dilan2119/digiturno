import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSalaDto } from './dto/create-sala.dto';
import { UpdateSalaDto } from './dto/update-sala.dto';

@Injectable()
export class SalasService {
  constructor(private prisma: PrismaService) {}

  create(dto: CreateSalaDto) {
    return this.prisma.sala.create({ data: dto });
  }

  findAll(sedeId?: number) {
    const where = sedeId ? { sedeId } : {};
    return this.prisma.sala.findMany({ where, orderBy: { nombre: 'asc' } });
  }

  async findOne(id: number) {
    const sala = await this.prisma.sala.findUnique({ where: { id } });
    if (!sala) throw new NotFoundException('Sala no encontrada');
    return sala;
  }

  async update(id: number, dto: UpdateSalaDto) {
    await this.findOne(id);
    return this.prisma.sala.update({ where: { id }, data: dto });
  }

  async remove(id: number) {
    await this.findOne(id);
    const visores = await this.prisma.visor.findMany({
      where: { salaId: id },
      select: { id: true },
    });
    for (const v of visores) {
      await this.prisma.playlist.deleteMany({ where: { visorId: v.id } });
    }
    await this.prisma.visor.deleteMany({ where: { salaId: id } });
    return this.prisma.sala.delete({ where: { id } });
  }
}
