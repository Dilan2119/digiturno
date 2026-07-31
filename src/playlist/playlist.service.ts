import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PlaylistService {
  constructor(private prisma: PrismaService) {}

  findAll(visorId?: number) {
    const where = visorId ? { visorId } : {};
    return this.prisma.playlist.findMany({ where, orderBy: { orden: 'asc' } });
  }

  async create(data: { visorId: number; tipo: string; url: string; orden?: number }) {
    const max = await this.prisma.playlist.aggregate({ where: { visorId: data.visorId }, _max: { orden: true } });
    return this.prisma.playlist.create({
      data: { ...data, tipo: data.tipo as any, orden: data.orden ?? (max._max.orden ?? -1) + 1 },
    });
  }

  async update(id: number, data: { activo?: boolean; orden?: number }) {
    const item = await this.prisma.playlist.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Ítem no encontrado');
    return this.prisma.playlist.update({ where: { id }, data });
  }

  async remove(id: number) {
    await this.update(id, {}); // check exists
    return this.prisma.playlist.delete({ where: { id } });
  }

  async reordenar(items: { id: number; orden: number }[]) {
    for (const item of items) {
      await this.prisma.playlist.update({ where: { id: item.id }, data: { orden: item.orden } });
    }
    return { success: true };
  }
}
