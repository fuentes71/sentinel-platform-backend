import { Injectable } from '@nestjs/common';
import { AlertsService } from '../alerts/alerts.service';
import { RulesService } from '../rules/rules.service';
import { AssetEventPayload } from './dto/asset-event.payload';
import { Event } from './entities/event.entity';
import { EventsGateway } from './events.gateway';
import { AssetsService } from '../assets/assets.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EventsService {

  constructor(
    private readonly gateway: EventsGateway,
    private readonly rulesService: RulesService,
    private readonly alertsService: AlertsService,
    private readonly assetsService: AssetsService,
    private readonly prisma: PrismaService,
  ) {}

  async create(
    assetId: string,
    type: 'status' | 'metric' | 'system',
    value: string | number,
  ): Promise<Event | null> {
    const asset = await this.assetsService.findById(assetId);
    if (!asset) {
      console.warn(`[EVENT] Asset ${assetId} não encontrado`);
      return null;
    }

    const hasCritical = await this.alertsService.hasActiveCriticalAlert(assetId);

    if (hasCritical) {
      if (!(type === 'status' && value === 'online')) {
        console.log(
          `[EVENT BLOCKED] Asset ${assetId} bloqueado por alerta CRITICAL`,
        );
        return null;
      }
    }

    const newEvent = await this.prisma.event.create({
      data: {
        assetId,
        type,
        value: String(value),
        timestamp: new Date(),
      },
    });

    const event: Event = {
      id: newEvent.id,
      assetId: newEvent.assetId,
      type: newEvent.type as 'status' | 'metric' | 'system',
      value: newEvent.value,
      timestamp: newEvent.timestamp,
    };

    await this.updateAssetFromEvent(event, hasCritical);

    const payload: AssetEventPayload = {
      eventId: event.id,
      assetId,
      type,
      value: isNaN(Number(event.value)) ? event.value : Number(event.value),
      timestamp: event.timestamp,
    };

    this.gateway.emitEventToAsset(assetId, payload);
    await this.evaluateRules(payload);

    return event;
  }

  private async evaluateRules(payload: AssetEventPayload): Promise<void> {
    if (payload.type !== 'metric') return;
    if (typeof payload.value !== 'number') return;

    const rules = await this.rulesService.findApplicableRules(payload.assetId);

    for (const rule of rules) {
      if (!this.rulesService.evaluate(rule, payload.value)) continue;

      const level = rule.level === 'strong' ? 'critical' : 'warning';

      const alert = await this.alertsService.create(
        payload.assetId,
        level as 'critical' | 'warning' | 'info',
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
        await this.assetsService.updateStatus(payload.assetId, 'offline', new Date());

        console.log(
          `[AUTO-ACTION] Asset ${payload.assetId} desligado por regra STRONG`,
        );
      }
    }
  }

  async resolveAlert(alertId: string, resolvedBy: string): Promise<void> {
    const { assetId, resolvedAt } = await this.alertsService.resolve(alertId);

    this.gateway.emitAlertResolvedToAsset(assetId, {
      alertId,
      assetId,
      resolvedBy,
      resolvedAt: resolvedAt.toISOString(),
    });
  }

  async findByAsset(assetId: string): Promise<Event[]> {
    return (await this.prisma.event.findMany({ where: { assetId }, orderBy: { timestamp: 'desc' } })) as Event[];
  }

  async findLatestByAsset(assetId: string): Promise<Event | null> {
    const event = await this.prisma.event.findFirst({
      where: { assetId },
      orderBy: { timestamp: 'desc' },
    });
    return event as Event | null;
  }

  async findAll(): Promise<Event[]> {
    return (await this.prisma.event.findMany({ orderBy: { timestamp: 'desc' } })) as Event[];
  }

  private async updateAssetFromEvent(event: Event, hasCritical: boolean): Promise<void> {
    if (hasCritical) return;

    if (event.type === 'status') {
      await this.assetsService.updateStatus(
        event.assetId,
        event.value as string,
        event.timestamp,
      );
    }
  }
}
