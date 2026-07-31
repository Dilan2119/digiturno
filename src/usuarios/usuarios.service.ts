import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';

@Injectable()
export class UsuariosService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateUsuarioDto) {
    const exists = await this.prisma.usuario.findUnique({ where: { email: dto.email } });
    if (exists) throw new ConflictException('El email ya está registrado');

    const passwordHash = await bcrypt.hash(dto.password, 10);
    return this.prisma.usuario.create({
      data: {
        sedeId: dto.sedeId,
        nombre: dto.nombre,
        email: dto.email,
        passwordHash,
        rol: dto.rol,
      },
      select: { id: true, nombre: true, email: true, rol: true, sedeId: true },
    });
  }

  findAll(sedeId?: number) {
    const where = sedeId ? { sedeId } : {};
    return this.prisma.usuario.findMany({
      where,
      select: { id: true, nombre: true, email: true, rol: true, sedeId: true },
      orderBy: { nombre: 'asc' },
    });
  }

  async findOne(id: number) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id },
      select: { id: true, nombre: true, email: true, rol: true, sedeId: true },
    });
    if (!usuario) throw new NotFoundException('Usuario no encontrado');
    return usuario;
  }

  async update(id: number, dto: UpdateUsuarioDto) {
    await this.findOne(id);
    const record = dto as any;
    const data: any = { ...dto };
    if (record.password) data.passwordHash = await bcrypt.hash(record.password, 10);
    delete data.password;
    return this.prisma.usuario.update({
      where: { id },
      data,
      select: { id: true, nombre: true, email: true, rol: true, sedeId: true },
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.usuario.delete({ where: { id } });
  }
}
