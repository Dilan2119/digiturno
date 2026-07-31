import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSedeDto } from './dto/create-sede.dto';
import { UpdateSedeDto } from './dto/update-sede.dto';

@Injectable()
export class SedesService {
  constructor(private prisma: PrismaService) {}

  create(dto: CreateSedeDto) {
    return this.prisma.sede.create({ data: dto });
  }

  findAll() {
    return this.prisma.sede.findMany({ orderBy: { nombre: 'asc' } });
  }

  async findOne(id: number) {
    const sede = await this.prisma.sede.findUnique({ where: { id } });
    if (!sede) throw new NotFoundException('Sede no encontrada');
    return sede;
  }

  async update(id: number, dto: UpdateSedeDto) {
    await this.findOne(id);
    return this.prisma.sede.update({ where: { id }, data: dto });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.sede.delete({ where: { id } });
  }
}
