import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { Asset } from '../assets/entities/asset.entity';
import { EventsService } from '../events/events.service';

@Controller()
export class SimulationController {
  private readonly logger = new Logger(SimulationController.name);
  
  /**
   * Estado interno do simulador
   * key = assetId
   * value = métrica atual
   */
  private metrics = new Map<string, number>();

  constructor(private readonly eventsService: EventsService) {}

  @EventPattern('simulate_asset')
  async handleSimulateAsset(@Payload() asset: Asset): Promise<void> {
    const current = this.metrics.get(asset.id) ?? this.randomBetween(40, 60);

    const variation = this.randomBetween(-8, 8);
    let metric = current + variation;

    metric = Math.max(0, Math.min(100, metric));
    this.metrics.set(asset.id, metric);

    await this.eventsService.create(asset.id, 'metric', Number(metric.toFixed(1)));

    this.logger.log(`[WORKER] ${asset.name} | metric=${metric.toFixed(1)}`);
  }

  private randomBetween(min: number, max: number): number {
    return Math.random() * (max - min) + min;
  }
}
