import { Controller, Get, Post, Body, Param, Patch, Delete, ParseIntPipe, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { getSedeFilter } from '../common/helpers/sede-filter.helper';
import { VisoresService } from './visores.service';
import { CreateVisorDto } from './dto/create-visor.dto';
import { UpdateVisorDto } from './dto/update-visor.dto';

@Controller('visores')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('admin_central')
export class VisoresController {
  constructor(private visores: VisoresService) {}

  @Post()
  create(@Body() dto: CreateVisorDto) {
    return this.visores.create(dto);
  }

  @Get()
  findAll(@Query('salaId') salaId: string, @CurrentUser() user: any) {
    return this.visores.findAll(salaId ? +salaId : undefined, getSedeFilter(user));
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.visores.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateVisorDto) {
    return this.visores.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.visores.remove(id);
  }
}
