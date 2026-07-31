import { Controller, Post, Get, Param, Body, ParseIntPipe, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { TurnosService } from './turnos.service';
import { TurnosGateway } from './turnos.gateway';
import { CreateTurnoDto } from './dto/create-turno.dto';

@Controller()
export class TurnosController {
  constructor(
    private turnos: TurnosService,
    private gateway: TurnosGateway,
  ) {}

  @Post('turnos')
  async crear(@Body() dto: CreateTurnoDto) {
    const turno = await this.turnos.crear(dto);
    const sedeId = turno.servicio?.sedeId ?? turno.sedeId;
    await this.gateway.emitToSede(sedeId, 'turno-creado', turno);
    return turno;
  }

  @Get('sedes/:sedeId/colas')
  colas(@Param('sedeId', ParseIntPipe) sedeId: number) {
    return this.turnos.colasPorSede(sedeId);
  }

  @Get('visores/:visorId/estado-actual')
  estadoActual(@Param('visorId', ParseIntPipe) visorId: number) {
    return this.turnos.estadoActualVisor(visorId);
  }

  @Post('turnos/:id/llamar')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('profesional', 'admin_central')
  async llamar(
    @Param('id', ParseIntPipe) id: number,
    @Body('moduloId', ParseIntPipe) moduloId: number,
    @CurrentUser() user: any,
  ) {
    const turno = await this.turnos.llamarTurno(id, moduloId, user.id);
    const sedeId = turno!.servicio?.sedeId ?? turno!.sedeId;
    await this.gateway.emitToSede(sedeId, 'turno-llamado', turno);
    return turno;
  }

  @Post('turnos/:id/re-llamar')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('profesional', 'admin_central')
  async reLlamar(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: any,
  ) {
    const turno = await this.turnos.reLlamarTurno(id, user.id);
    const sedeId = turno!.servicio?.sedeId ?? turno!.sedeId;
    await this.gateway.emitToSede(sedeId, 'turno-re-llamado', turno);
    return turno;
  }

  @Post('turnos/:id/ausente')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('profesional', 'admin_central')
  async ausente(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: any,
  ) {
    const turno = await this.turnos.marcarAusente(id, user.id);
    const sedeId = turno!.servicio?.sedeId ?? turno!.sedeId;
    await this.gateway.emitToSede(sedeId, 'turno-ausente', turno);
    return turno;
  }

  @Post('turnos/:id/finalizar')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('profesional', 'admin_central')
  async finalizar(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: any,
  ) {
    const turno = await this.turnos.finalizarAtencion(id, user.id);
    const sedeId = turno!.servicio?.sedeId ?? turno!.sedeId;
    await this.gateway.emitToSede(sedeId, 'atencion-finalizada', turno);
    return turno;
  }
}
