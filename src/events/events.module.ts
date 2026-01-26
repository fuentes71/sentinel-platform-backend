import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { RulesModule } from '../rules/rules.model';
import { AlertsModule } from './../alerts/alerts.module';
import { EventsGateway } from './events.gateway';
import { EventsService } from './events.service';

@Module({
  imports: [RulesModule, AlertsModule, AuthModule],
  providers: [EventsGateway, EventsService],
  exports: [EventsService],
})
export class EventsModule {}
