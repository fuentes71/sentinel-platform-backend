import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { AssetsService } from '../assets/assets.service';
import { Asset } from '../assets/entities/asset.entity';
import { EventsService } from '../events/events.service';

@Injectable()
export class SimulatorService {
  constructor(
    private readonly assetsService: AssetsService,
    private readonly eventsService: EventsService,
  ) {}

  @Cron('*/5 * * * * *') // a cada 5 segundos
  simulate(): void {
    const assets: Asset[] = this.assetsService.findAll();

    assets.forEach((asset) => {
      const random = Math.random();

      let status: 'online' | 'offline' | 'warning' = 'online';

      if (random > 0.8) status = 'warning';
      if (random > 0.95) status = 'offline';

      const updated = this.assetsService.updateStatus(asset.id, status);
      if (!updated) return;

      // 👇 ÚNICA chamada necessária
      this.eventsService.create(asset.id, 'status', status);

      console.log(`[SIMULATOR] ${asset.name} → ${status}`);
    });
  }
}
