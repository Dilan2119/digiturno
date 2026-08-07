import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { TurnosService } from './turnos.service';
import { PrismaService } from '../prisma/prisma.service';

@WebSocketGateway({
  namespace: '/visor',
  cors: true,
})
export class TurnosGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    private prisma: PrismaService,
    private turnosService: TurnosService,
    private jwtService: JwtService,
  ) {}

  async handleConnection(client: Socket) {
    const token = client.handshake.auth?.token || (client.handshake.query?.token as string);
    if (token) {
      try {
        const payload = this.jwtService.verify(token);
        const user = await this.prisma.usuario.findUnique({
          where: { id: payload.sub },
          select: { id: true, email: true, rol: true, sedeId: true },
        });
        if (user) client.data.user = user;
      } catch {}
    }

    if (client.data.user) {
      // Es un profesional (Módulo de Atención)
      const sedeId = client.data.user.sedeId;
      if (!sedeId) {
        client.disconnect();
        return;
      }
      await client.join(`atencion:sede:${sedeId}`);
      // Ya no necesitamos salaId para los profesionales
    } else {
      // Es un Visor (requiere salaId)
      const salaId = parseInt(client.handshake.query.salaId as string, 10);
      if (!salaId || isNaN(salaId)) {
        client.emit('error', { message: 'salaId es requerido para el visor' });
        client.disconnect();
        return;
      }

      const sala = await this.prisma.sala.findUnique({
        where: { id: salaId },
        select: { id: true, sedeId: true },
      });

      if (!sala) {
        client.emit('error', { message: 'Sala no encontrada' });
        client.disconnect();
        return;
      }

      client.data.salaId = salaId;
      client.data.sedeId = sala.sedeId;

      await client.join(`visor:sede:${sala.sedeId}`);

      const visores = await this.prisma.visor.findMany({
        where: { salaId },
        select: { id: true },
      });
      for (const v of visores) {
        client.emit('reconciliar-estado', { visorId: v.id });
      }
    }
  }

  handleDisconnect(_client: Socket) {}

  emitToRoom(room: string, event: string, payload: any) {
    this.server.to(room).emit(event, payload);
  }

  // Notifica a todos los profesionales y visores en la Sede
  async notifyCallAction(sedeId: number, event: string, payload: any) {
    this.server.to(`atencion:sede:${sedeId}`).emit(event, payload);
    this.server.to(`visor:sede:${sedeId}`).emit(event, payload);
  }

  // Notifica globalmente en la Sede
  async emitToSede(sedeId: number, event: string, payload: any) {
    this.server.to(`atencion:sede:${sedeId}`).emit(event, payload);
  }

  @SubscribeMessage('llamar-turno')
  async handleLlamarTurno(client: Socket, payload: { turnoId: number; moduloId: number }) {
    const user = client.data.user;
    if (!user) return { success: false, message: 'No autenticado' };
    try {
      const turno = await this.turnosService.llamarTurno(payload.turnoId, payload.moduloId, user.id);
      const sedeId = turno!.servicio?.sedeId ?? turno!.sedeId;
      await this.notifyCallAction(sedeId, 'turno-llamado', turno);
      return turno;
    } catch (e: any) {
      return { success: false, message: e.message };
    }
  }

  @SubscribeMessage('re-llamar-turno')
  async handleReLlamarTurno(client: Socket, payload: { turnoId: number }) {
    const user = client.data.user;
    if (!user) return { success: false, message: 'No autenticado' };
    try {
      const turno = await this.turnosService.reLlamarTurno(payload.turnoId, user.id);
      const sedeId = turno!.servicio?.sedeId ?? turno!.sedeId;
      await this.notifyCallAction(sedeId, 'turno-re-llamado', turno);
      return turno;
    } catch (e: any) {
      return { success: false, message: e.message };
    }
  }

  @SubscribeMessage('turno-ausente')
  async handleAusente(client: Socket, payload: { turnoId: number }) {
    const user = client.data.user;
    if (!user) return { success: false, message: 'No autenticado' };
    try {
      const turno = await this.turnosService.marcarAusente(payload.turnoId, user.id);
      const sedeId = turno!.servicio?.sedeId ?? turno!.sedeId;
      await this.notifyCallAction(sedeId, 'turno-ausente', turno);
      return turno;
    } catch (e: any) {
      return { success: false, message: e.message };
    }
  }

  @SubscribeMessage('finalizar-atencion')
  async handleFinalizar(client: Socket, payload: { turnoId: number }) {
    const user = client.data.user;
    if (!user) return { success: false, message: 'No autenticado' };
    try {
      const turno = await this.turnosService.finalizarAtencion(payload.turnoId, user.id);
      const sedeId = turno!.servicio?.sedeId ?? turno!.sedeId;
      await this.notifyCallAction(sedeId, 'atencion-finalizada', turno);
      return turno;
    } catch (e: any) {
      return { success: false, message: e.message };
    }
  }
}
