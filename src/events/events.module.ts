import { forwardRef, Module } from '@nestjs/common';
import { AlertsModule } from '../alerts/alerts.module';
import { AssetsModule } from '../assets/assets.module';
import { AuthModule } from '../auth/auth.module';
import { RulesModule } from '../rules/rules.module';
import { EventsController } from './events.controller';
import { EventsGateway } from './events.gateway';
import { EventsService } from './events.service';
import { WsAuthService } from '../common/middleware/ws-auth.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [
    RulesModule,
    AlertsModule,
    AuthModule,
    forwardRef(() => AssetsModule),
    PrismaModule,
  ],
  controllers: [EventsController],
  providers: [EventsGateway, EventsService, WsAuthService],
  exports: [EventsService],
})
export class EventsModule {}
