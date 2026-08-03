import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSedeDto } from './dto/create-sede.dto';
import { UpdateSedeDto } from './dto/update-sede.dto';

@Injectable()
export class SedesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateSedeDto) {
    try {
      return await this.prisma.sede.create({ data: dto });
    } catch (e: any) {
      if (e.code === 'P2002') throw new ConflictException('Ya existe una sede con esos datos');
      throw e;
    }
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
