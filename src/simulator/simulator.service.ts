import { Injectable, Inject } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ClientProxy } from '@nestjs/microservices';
import { AssetsService } from '../assets/assets.service';
import { Asset } from '../assets/entities/asset.entity';

@Injectable()
export class SimulatorService {
  constructor(
    private readonly assetsService: AssetsService,
    @Inject('SIMULATION_SERVICE') private client: ClientProxy,
  ) {}

  @Cron('*/5 * * * * *') // a cada 5 segundos
  async simulate(): Promise<void> {
    const assets: Asset[] = await this.assetsService.findAll();

    assets.forEach((asset) => {
      // Dispara a mensagem para a fila do RabbitMQ
      this.client.emit('simulate_asset', asset);
    });

    console.log(`[SIMULATOR] Enviado ${assets.length} ativos para fila de simulação.`);
  }
}
