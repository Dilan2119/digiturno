import { Controller, Get, Post, Body, Param, Patch, Delete, ParseIntPipe, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { getSedeFilter } from '../common/helpers/sede-filter.helper';
import { ServiciosService } from './servicios.service';
import { CreateServicioDto } from './dto/create-servicio.dto';
import { UpdateServicioDto } from './dto/update-servicio.dto';

@Controller()
export class ServiciosController {
  constructor(private servicios: ServiciosService) {}

  @Post('servicios')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin_central')
  create(@Body() dto: CreateServicioDto) {
    return this.servicios.create(dto);
  }

  @Get('sedes/:sedeId/servicios')
  findAllBySede(@Param('sedeId', ParseIntPipe) sedeId: number) {
    return this.servicios.findAll(sedeId);
  }

  @Get('servicios')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin_central')
  findAll(@Query('sedeId') sedeId: string, @CurrentUser() user: any) {
    return this.servicios.findAll(getSedeFilter(user, sedeId));
  }

  @Get('servicios/:id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin_central')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.servicios.findOne(id);
  }

  @Patch('servicios/:id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin_central')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateServicioDto) {
    return this.servicios.update(id, dto);
  }

  @Delete('servicios/:id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin_central')
  remove(@Param('id', ParseIntPipe) id: number, @Query('force') force?: string) {
    return this.servicios.remove(id, force === 'true');
  }
}
