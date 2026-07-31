import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getMetricas(sedeId?: number) {
    const whereSede = sedeId ? { sedeId } : {};

    const eventos = await this.prisma.turnoEvento.findMany({
      where: { turno: whereSede },
      include: {
        turno: { include: { servicio: true } },
        usuario: { select: { id: true, nombre: true } },
      },
      orderBy: { timestamp: 'asc' },
    });

    const tiemposEspera: Record<string, number[]> = {};
    const atendidosPorProfesional: Record<string, number> = {};
    let ausentes = 0;

    const creados = new Map<number, Date>();
    for (const e of eventos) {
      if (e.tipoEvento === 'creado') creados.set(e.turnoId, e.timestamp);
      if (e.tipoEvento === 'llamado') {
        const inicio = creados.get(e.turnoId);
        if (inicio) {
          const seg = (e.timestamp.getTime() - inicio.getTime()) / 1000;
          const key = e.turno.servicio.nombre;
          if (!tiemposEspera[key]) tiemposEspera[key] = [];
          tiemposEspera[key].push(seg);
        }
      }
      if (e.tipoEvento === 'llamado' || e.tipoEvento === 'iniciado_atencion') {
        const key = `${e.usuario?.nombre || 'Sistema'}_${e.timestamp.toISOString().slice(0, 10)}`;
        atendidosPorProfesional[key] = (atendidosPorProfesional[key] || 0) + 1;
      }
      if (e.tipoEvento === 'ausente') ausentes++;
    }

    const promedioEspera = Object.entries(tiemposEspera).map(([servicio, tiempos]) => ({
      servicio,
      promedioSeg: Math.round(tiempos.reduce((a, b) => a + b, 0) / tiempos.length),
      cantidad: tiempos.length,
    }));

    const atendidos = Object.entries(atendidosPorProfesional).map(([key, total]) => {
      const [nombre, fecha] = key.split('_');
      return { profesional: nombre, fecha, total };
    });

    return { promedioEspera, atendidos, ausentes };
  }
}
