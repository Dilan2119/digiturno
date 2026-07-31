import { Controller, Get, Post, Body, Param, Patch, Delete, ParseIntPipe, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { SedesService } from './sedes.service';
import { CreateSedeDto } from './dto/create-sede.dto';
import { UpdateSedeDto } from './dto/update-sede.dto';

@Controller('sedes')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('admin_central')
export class SedesController {
  constructor(private sedes: SedesService) {}

  @Post()
  create(@Body() dto: CreateSedeDto) {
    return this.sedes.create(dto);
  }

  @Get()
  findAll() {
    return this.sedes.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.sedes.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateSedeDto) {
    return this.sedes.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.sedes.remove(id);
  }
}
