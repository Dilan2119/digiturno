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

    const salaId = parseInt(client.handshake.query.salaId as string, 10);
    if (!salaId || isNaN(salaId)) {
      client.emit('error', { message: 'salaId es requerido' });
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

    if (client.data.user) {
      // Es un profesional (Módulo de Atención)
      await client.join(`atencion:sede:${sala.sedeId}`);
      await client.join(`atencion:sala:${salaId}`);
    } else {
      // Es un Visor
      await client.join(`visor:sala:${salaId}`);
    }

    const visores = await this.prisma.visor.findMany({
      where: { salaId },
      select: { id: true },
    });
    for (const v of visores) {
      client.emit('reconciliar-estado', { visorId: v.id });
    }
  }

  handleDisconnect(_client: Socket) {}

  emitToRoom(room: string, event: string, payload: any) {
    this.server.to(room).emit(event, payload);
  }

  // Notifica a todos los profesionales (Atención) en la Sede y solo a los Visores de una Sala específica
  async notifyCallAction(sedeId: number, salaId: number, event: string, payload: any) {
    // Atención: necesitan saber de todos los llamados para actualizar sus colas de espera
    this.server.to(`atencion:sede:${sedeId}`).emit(event, payload);
    // Visores: solo muestran los llamados de la sala donde físicamente se ubican
    this.server.to(`visor:sala:${salaId}`).emit(event, payload);
  }

  // Notifica globalmente en la Sede (ej: para cuando se crea un turno nuevo en el dispensador)
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
      const salaId = client.data.salaId;
      await this.notifyCallAction(sedeId, salaId, 'turno-llamado', turno);
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
      const salaId = client.data.salaId;
      await this.notifyCallAction(sedeId, salaId, 'turno-re-llamado', turno);
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
      const salaId = client.data.salaId;
      await this.notifyCallAction(sedeId, salaId, 'turno-ausente', turno);
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
      const salaId = client.data.salaId;
      await this.notifyCallAction(sedeId, salaId, 'atencion-finalizada', turno);
      return turno;
    } catch (e: any) {
      return { success: false, message: e.message };
    }
  }
}
