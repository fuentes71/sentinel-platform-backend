import { Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { AlertsService } from './alerts.service';
import { AdminGuard } from '../common/guards/admin.guard';
import { AdminOnly } from '../common/decorators/admin-only.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('alerts')
@UseGuards(JwtAuthGuard)
export class AlertsController {
  constructor(private readonly alertsService: AlertsService) {}

  @Get()
  findAll() {
    return this.alertsService.findAll();
  }

  @Get('active')
  findActive() {
    return this.alertsService.findAll().filter((a) => !a.resolved);
  }

  @Get('resolved')
  findResolved() {
    return this.alertsService.findAll().filter((a) => a.resolved);
  }

  @Patch('resolve/:id')
  @AdminOnly()
  @UseGuards(AdminGuard)
  resolve(@Param('id') id: string) {
    return this.alertsService.resolve(id);
  }

  @Get('critical/check/:assetId')
  hasActiveCriticalAlert(@Param('assetId') assetId: string) {
    return this.alertsService.hasActiveCriticalAlert(assetId);
  }
}
