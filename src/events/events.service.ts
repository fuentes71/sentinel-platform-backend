import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { AlertsService } from '../alerts/alerts.service';
import { RulesService } from '../rules/rules.service';
import { AssetEventPayload } from './dto/asset-event.payload';
import { Event } from './entities/event.entity';
import { EventsGateway } from './events.gateway';

@Injectable()
export class EventsService {
  private events: Event[] = [];

  constructor(
    private readonly gateway: EventsGateway,
    private readonly rulesService: RulesService,
    private readonly alertsService: AlertsService,
  ) {}

  create(
    assetId: string,
    type: 'status' | 'metric',
    value: string | number,
  ): Event {
    const event: Event = {
      id: uuidv4(),
      assetId,
      type,
      value,
      timestamp: new Date(),
    };

    this.events.push(event);

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
    if (typeof payload.value !== 'number') return;

    const rules = this.rulesService.findByAsset(payload.assetId);

    for (const rule of rules) {
      if (!this.rulesService.evaluate(rule, payload.value)) continue;

      const alert = this.alertsService.create(
        payload.assetId,
        'warning',
        `Regra violada: valor ${payload.value} ${rule.condition} ${rule.threshold}`,
      );

      this.gateway.emitAlertResolvedToAsset(alert.assetId, {
        alertId: alert.alertId,
        assetId: alert.assetId,
        resolvedBy: '',
        resolvedAt: alert.createdAt.toISOString(),
      });
    }
  }

  resolveAlert(alertId: string, resolvedBy: string): void {
    const { assetId } = this.alertsService.resolve(alertId);

    this.gateway.emitAlertResolvedToAsset(assetId, {
      alertId,
      assetId,
      resolvedBy,
      resolvedAt: new Date().toISOString(),
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
}
