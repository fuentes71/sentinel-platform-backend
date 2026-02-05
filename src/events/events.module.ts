import { forwardRef, Module } from '@nestjs/common';
import { AlertsModule } from '../alerts/alerts.module';
import { AssetsModule } from '../assets/assets.module';
import { AuthModule } from '../auth/auth.module';
import { RulesModule } from '../rules/rules.module';
import { EventsController } from './events.controller';
import { EventsGateway } from './events.gateway';
import { EventsService } from './events.service';

@Module({
  imports: [
    RulesModule,
    AlertsModule,
    AuthModule,
    forwardRef(() => AssetsModule),
  ],
  controllers: [EventsController],
  providers: [EventsGateway, EventsService],
  exports: [EventsService],
})
export class EventsModule {}
