import { Module } from '@nestjs/common';
import { AssetsController } from './assets.controller';
import { AssetsService } from './assets.service';
import { AlertsModule } from '../alerts/alerts.module';
import { EventsModule } from '../events/events.module';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  controllers: [AssetsController],
  providers: [AssetsService],
  imports: [AlertsModule, EventsModule, PrismaModule],
  exports: [AssetsService],
})
export class AssetsModule {}
