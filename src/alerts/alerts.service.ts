import { Injectable } from '@nestjs/common';
import { v4 as uuid } from 'uuid';
import { Alert } from './entities/alert.entity';

@Injectable()
export class AlertsService {
  private alerts: Alert[] = [];

  create(
    assetId: string,
    level: 'info' | 'warning' | 'critical',
    message: string,
  ): {
    alertId: string;
    assetId: string;
    level: 'info' | 'warning' | 'critical';
    message: string;
    createdAt: Date;
  } {
    const alertId = uuid();

    const newAlert: Alert = {
      id: alertId,
      assetId,
      level,
      message,
      resolved: false,
      createdAt: new Date(),
    };

    this.alerts.push(newAlert);

    return {
      alertId,
      assetId: assetId ?? null,
      level,
      message,
      createdAt: newAlert.createdAt,
    };
  }

  findAll(): Alert[] {
    return this.alerts;
  }

  resolve(id: string): {
    alertId: string;
    assetId: string;
    resolvedAt: Date;
  } {
    const alert = this.alerts.find((a) => a.id === id);
    if (!alert) throw new Error('Alerta não encontrado');

    alert.resolved = true;
    alert.resolvedAt = new Date();

    return {
      alertId: alert.id,
      assetId: alert.assetId,
      resolvedAt: alert.resolvedAt,
    };
  }

  findActive(): Alert[] {
    return this.alerts.filter((a) => !a.resolved);
  }

  findResolved(): Alert[] {
    return this.alerts.filter((a) => a.resolved);
  }

  hasActiveCriticalAlert(assetId: string): boolean {
    return this.alerts.some(
      (alert) =>
        alert.assetId === assetId &&
        alert.level === 'critical' &&
        !alert.resolved,
    );
  }

  removeByAsset(assetId: string): void {
    this.alerts = this.alerts.filter((a) => a.assetId !== assetId);
  }
}
