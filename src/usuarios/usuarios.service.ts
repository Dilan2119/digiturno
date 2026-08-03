import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';

const INCLUDE_SERVICIOS = {
  servicios: {
    select: { id: true, nombre: true, prefijo: true, sedeId: true },
  },
};

@Injectable()
export class UsuariosService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateUsuarioDto) {
    const exists = await this.prisma.usuario.findUnique({ where: { email: dto.email } });
    if (exists) throw new ConflictException('El email ya está registrado');

    const { serviciosIds, password, ...rest } = dto;
    const passwordHash = await bcrypt.hash(password, 10);
    const created = await this.prisma.usuario.create({
      data: {
        ...rest,
        passwordHash,
        servicios: serviciosIds?.length ? { connect: serviciosIds.map(id => ({ id })) } : undefined,
      },
    });
    return this.findOne(created.id);
  }

  async findAll(sedeId?: number) {
    const where = sedeId ? { sedeId } : {};
    return this.prisma.usuario.findMany({
      where,
      include: INCLUDE_SERVICIOS,
      orderBy: { nombre: 'asc' },
    }).then(users => users.map(u => {
      const { passwordHash, ...safe } = u as any;
      return safe;
    }));
  }

  async findOne(id: number) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id },
      include: INCLUDE_SERVICIOS,
    });
    if (!usuario) throw new NotFoundException('Usuario no encontrado');
    const { passwordHash, ...safe } = usuario as any;
    return safe;
  }

  async update(id: number, dto: UpdateUsuarioDto) {
    await this.findOne(id);
    const { serviciosIds, password, ...rest } = dto as any;
    const data: any = { ...rest };
    if (password) data.passwordHash = await bcrypt.hash(password, 10);

    if (serviciosIds !== undefined) {
      data.servicios = { set: serviciosIds.map((sid: number) => ({ id: sid })) };
    }

    await this.prisma.usuario.update({ where: { id }, data });
    return this.findOne(id);
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.usuario.delete({ where: { id } });
  }
}
