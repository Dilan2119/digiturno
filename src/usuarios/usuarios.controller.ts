import { Controller, Get, Post, Body, Param, Patch, Delete, ParseIntPipe, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { getSedeFilter } from '../common/helpers/sede-filter.helper';
import { UsuariosService } from './usuarios.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';

@Controller('usuarios')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('admin_central')
export class UsuariosController {
  constructor(private usuarios: UsuariosService) {}

  @Post()
  create(@Body() dto: CreateUsuarioDto) {
    return this.usuarios.create(dto);
  }

  @Get()
  findAll(@Query('sedeId') sedeId: string, @CurrentUser() user: any) {
    return this.usuarios.findAll(getSedeFilter(user, sedeId));
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usuarios.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateUsuarioDto) {
    return this.usuarios.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.usuarios.remove(id);
  }
}
