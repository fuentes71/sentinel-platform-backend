import { Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { AlertsService } from './alerts.service';
import { AdminGuard } from '../common/guards/admin.guard';
import { AdminOnly } from '../common/decorators/admin-only.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('alerts')
@UseGuards(JwtAuthGuard)
export class AlertsController {
  constructor(private readonly alertsService: AlertsService) {}

  /**
   * Lista todos os alertas
   */
  @Get()
  findAll() {
    return this.alertsService.findAll();
  }

  /**
   * Lista apenas alertas ativos
   */
  @Get('active')
  findActive() {
    return this.alertsService.findAll().filter((a) => !a.resolved);
  }

  /**
   * Lista apenas alertas resolvidos
   */
  @Get('resolved')
  findResolved() {
    return this.alertsService.findAll().filter((a) => a.resolved);
  }

  /**
   * Resolver alerta (ADMIN)
   */
  @Patch(':id/resolve')
  @AdminOnly()
  @UseGuards(AdminGuard)
  resolve(@Param('id') id: string) {
    return this.alertsService.resolve(id);
  }
}
