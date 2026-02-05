import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { AssetsService } from '../assets/assets.service';
import { Asset } from '../assets/entities/asset.entity';
import { EventsService } from '../events/events.service';

@Injectable()
export class SimulatorService {
  /**
   * Estado interno do simulador
   * key = assetId
   * value = métrica atual
   */
  private metrics = new Map<string, number>();

  constructor(
    private readonly assetsService: AssetsService,
    private readonly eventsService: EventsService,
  ) {}

  @Cron('*/5 * * * * *') // a cada 5 segundos
  simulate(): void {
    const assets: Asset[] = this.assetsService.findAll();

    assets.forEach((asset) => {
      const current = this.metrics.get(asset.id) ?? this.randomBetween(40, 60);

      const variation = this.randomBetween(-8, 8);
      let metric = current + variation;

      metric = Math.max(0, Math.min(100, metric));
      this.metrics.set(asset.id, metric);

      this.eventsService.create(asset.id, 'metric', Number(metric.toFixed(1)));

      console.log(`[SIMULATOR] ${asset.name} | metric=${metric.toFixed(1)}`);
    });
  }

  private randomBetween(min: number, max: number): number {
    return Math.random() * (max - min) + min;
  }
}
