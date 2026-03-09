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
  async findAll() {
    return await this.alertsService.findAll();
  }

  @Get('active')
  async findActive() {
    return await this.alertsService.findActive();
  }

  @Get('resolved')
  async findResolved() {
    return await this.alertsService.findResolved();
  }

  @Patch('resolve/:id')
  @AdminOnly()
  @UseGuards(AdminGuard)
  async resolve(@Param('id') id: string) {
    return await this.alertsService.resolve(id);
  }

  @Get('critical/check/:assetId')
  async hasActiveCriticalAlert(@Param('assetId') assetId: string) {
    return await this.alertsService.hasActiveCriticalAlert(assetId);
  }
}
