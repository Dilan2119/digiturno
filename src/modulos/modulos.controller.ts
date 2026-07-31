import { Controller, Get, Post, Body, Param, Patch, Delete, ParseIntPipe, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { getSedeFilter } from '../common/helpers/sede-filter.helper';
import { ModulosService } from './modulos.service';
import { CreateModuloDto } from './dto/create-modulo.dto';
import { UpdateModuloDto } from './dto/update-modulo.dto';

@Controller('modulos')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class ModulosController {
  constructor(private modulos: ModulosService) {}

  @Post()
  @Roles('admin_central')
  create(@Body() dto: CreateModuloDto) {
    return this.modulos.create(dto);
  }

  @Get()
  findAll(@Query('sedeId') sedeId: string, @CurrentUser() user: any) {
    return this.modulos.findAll(getSedeFilter(user, sedeId));
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.modulos.findOne(id);
  }

  @Patch(':id')
  @Roles('admin_central')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateModuloDto) {
    return this.modulos.update(id, dto);
  }

  @Delete(':id')
  @Roles('admin_central')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.modulos.remove(id);
  }
}
