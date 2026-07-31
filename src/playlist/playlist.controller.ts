import { Controller, Get, Post, Patch, Delete, Body, Param, Query, ParseIntPipe, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { PlaylistService } from './playlist.service';

@Controller('playlist')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('admin_central')
export class PlaylistController {
  constructor(private service: PlaylistService) {}

  @Get()
  findAll(@Query('visorId') visorId?: string) {
    return this.service.findAll(visorId ? parseInt(visorId, 10) : undefined);
  }

  @Post()
  create(@Body() body: { visorId: number; tipo: string; url: string; orden?: number }) {
    return this.service.create(body);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() body: { activo?: boolean; orden?: number }) {
    return this.service.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }

  @Post('reordenar')
  reordenar(@Body() body: { items: { id: number; orden: number }[] }) {
    return this.service.reordenar(body.items);
  }
}
