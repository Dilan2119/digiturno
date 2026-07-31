import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { getSedeFilter } from '../common/helpers/sede-filter.helper';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('admin_central')
export class DashboardController {
  constructor(private service: DashboardService) {}

  @Get('metricas')
  getMetricas(@Query('sedeId') sedeId: string, @CurrentUser() user: any) {
    return this.service.getMetricas(getSedeFilter(user, sedeId));
  }
}
