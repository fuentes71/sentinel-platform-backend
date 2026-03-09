import { Injectable, NotFoundException } from '@nestjs/common';
import { Alert } from './entities/alert.entity';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AlertsService {
  constructor(private prisma: PrismaService) {}

  async create(
    assetId: string,
    level: 'critical' | 'warning' | 'info',
    message: string,
  ): Promise<{
    alertId: string;
    assetId: string;
    level: 'critical' | 'warning' | 'info';
    message: string;
    createdAt: Date;
  }> {

    const newAlert = await this.prisma.alert.create({
      data: {
        assetId,
        level,
        message,
        resolved: false,
      },
    });

    return {
      alertId: newAlert.id,
      assetId: newAlert.assetId,
      level: newAlert.level as 'critical' | 'warning' | 'info',
      message: newAlert.message,
      createdAt: newAlert.createdAt,
    };
  }

  async findAll(): Promise<Alert[]> {
    return (await this.prisma.alert.findMany()) as Alert[];
  }

  async resolve(id: string): Promise<{
    alertId: string;
    assetId: string;
    resolvedAt: Date;
  }> {
    const alert = await this.prisma.alert.findUnique({ where: { id } });
    if (!alert) throw new NotFoundException('Alerta não encontrado');

    const updatedAlert = await this.prisma.alert.update({
      where: { id },
      data: {
        resolved: true,
        resolvedAt: new Date(),
      },
    });

    return {
      alertId: updatedAlert.id,
      assetId: updatedAlert.assetId,
      resolvedAt: updatedAlert.resolvedAt as Date,
    };
  }

  async findActive(): Promise<Alert[]> {
    return (await this.prisma.alert.findMany({ where: { resolved: false } })) as Alert[];
  }

  async findResolved(): Promise<Alert[]> {
    return (await this.prisma.alert.findMany({ where: { resolved: true } })) as Alert[];
  }

  async hasActiveCriticalAlert(assetId: string): Promise<boolean> {
    const criticalAlert = await this.prisma.alert.findFirst({
      where: {
        assetId,
        level: 'critical',
        resolved: false,
      },
    });
    return !!criticalAlert;
  }

  async removeByAsset(assetId: string): Promise<void> {
    await this.prisma.alert.deleteMany({
      where: { assetId },
    });
  }
}
