import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateModuloDto } from './dto/create-modulo.dto';
import { UpdateModuloDto } from './dto/update-modulo.dto';

@Injectable()
export class ModulosService {
  constructor(private prisma: PrismaService) {}

  create(dto: CreateModuloDto) {
    return this.prisma.modulo.create({ data: dto });
  }

  findAll(sedeId?: number) {
    const where = sedeId ? { sedeId } : {};
    return this.prisma.modulo.findMany({ where, orderBy: { nombre: 'asc' } });
  }

  async findOne(id: number) {
    const modulo = await this.prisma.modulo.findUnique({ where: { id } });
    if (!modulo) throw new NotFoundException('Módulo no encontrado');
    return modulo;
  }

  async update(id: number, dto: UpdateModuloDto) {
    await this.findOne(id);
    return this.prisma.modulo.update({ where: { id }, data: dto });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.modulo.delete({ where: { id } });
  }
}
