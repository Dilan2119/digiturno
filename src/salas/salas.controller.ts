import { Controller, Get, Post, Body, Param, Patch, Delete, ParseIntPipe, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { getSedeFilter } from '../common/helpers/sede-filter.helper';
import { SalasService } from './salas.service';
import { CreateSalaDto } from './dto/create-sala.dto';
import { UpdateSalaDto } from './dto/update-sala.dto';

@Controller('salas')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class SalasController {
  constructor(private salas: SalasService) {}

  @Post()
  @Roles('admin_central')
  create(@Body() dto: CreateSalaDto) {
    return this.salas.create(dto);
  }

  @Get()
  findAll(@Query('sedeId') sedeId: string, @CurrentUser() user: any) {
    return this.salas.findAll(getSedeFilter(user, sedeId));
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.salas.findOne(id);
  }

  @Patch(':id')
  @Roles('admin_central')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateSalaDto) {
    return this.salas.update(id, dto);
  }

  @Delete(':id')
  @Roles('admin_central')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.salas.remove(id);
  }
}
