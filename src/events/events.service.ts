import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { AlertsService } from '../alerts/alerts.service';
import { RulesService } from '../rules/rules.service';
import { AssetEventPayload } from './dto/asset-event.payload';
import { Event } from './entities/event.entity';
import { EventsGateway } from './events.gateway';
import { Asset } from '../assets/entities/asset.entity';
import { AssetsService } from '../assets/assets.service';

@Injectable()
export class EventsService {
  private events: Event[] = [];

  constructor(
    private readonly gateway: EventsGateway,
    private readonly rulesService: RulesService,
    private readonly alertsService: AlertsService,
    private readonly assetsService: AssetsService,
  ) {}

  create(
    assetId: string,
    type: 'status' | 'metric' | 'system',
    value: string | number,
  ): Event | null {
    const asset = this.assetsService.findById(assetId);
    if (!asset) {
      console.warn(`[EVENT] Asset ${assetId} não encontrado`);
      return null;
    }

    const hasCritical = this.alertsService.hasActiveCriticalAlert(assetId);

    if (hasCritical) {
      if (!(type === 'status' && value === 'online')) {
        console.log(
          `[EVENT BLOCKED] Asset ${assetId} bloqueado por alerta CRITICAL`,
        );
        return null;
      }
    }

    const event: Event = {
      id: uuidv4(),
      assetId,
      type,
      value,
      timestamp: new Date(),
    };

    this.events.push(event);

    this.updateAssetFromEvent(event, hasCritical);

    const payload: AssetEventPayload = {
      eventId: event.id,
      assetId,
      type,
      value,
      timestamp: event.timestamp,
    };

    this.gateway.emitEventToAsset(assetId, payload);
    this.evaluateRules(payload);

    return event;
  }

  private evaluateRules(payload: AssetEventPayload): void {
    if (payload.type !== 'metric') return;
    if (typeof payload.value !== 'number') return;

    const rules = this.rulesService.findApplicableRules(payload.assetId);

    for (const rule of rules) {
      if (!this.rulesService.evaluate(rule, payload.value)) continue;

      const level = rule.level === 'strong' ? 'critical' : 'warning';

      const alert = this.alertsService.create(
        payload.assetId,
        level,
        `Regra violada (${rule.level}): valor ${payload.value} ${rule.condition} ${rule.threshold}`,
      );

      this.gateway.emitAlertCreatedToAsset(payload.assetId, {
        alertId: alert.alertId,
        assetId: payload.assetId,
        level: alert.level,
        message: alert.message,
        createdAt: alert.createdAt.toISOString(),
      });

      if (rule.level === 'strong') {
        this.assetsService.updateStatus(payload.assetId, 'offline', new Date());

        console.log(
          `[AUTO-ACTION] Asset ${payload.assetId} desligado por regra STRONG`,
        );
      }
    }
  }

  resolveAlert(alertId: string, resolvedBy: string): void {
    const { assetId, resolvedAt } = this.alertsService.resolve(alertId);

    this.gateway.emitAlertResolvedToAsset(assetId, {
      alertId,
      assetId,
      resolvedBy,
      resolvedAt: resolvedAt.toISOString(),
    });
  }

  findByAsset(assetId: string): Event[] {
    return this.events.filter((e) => e.assetId === assetId);
  }

  findLatestByAsset(assetId: string): Event | undefined {
    for (let i = this.events.length - 1; i >= 0; i--) {
      if (this.events[i].assetId === assetId) return this.events[i];
    }
    return undefined;
  }

  findAll(): Event[] {
    return this.events;
  }

  private updateAssetFromEvent(event: Event, hasCritical: boolean): void {
    if (hasCritical) return;

    if (event.type === 'status') {
      this.assetsService.updateStatus(
        event.assetId,
        event.value as Asset['status'],
        event.timestamp,
      );
    }
  }
}
