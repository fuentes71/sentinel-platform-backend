import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { SimulatorService } from './simulator.service';
import { AssetsModule } from '../assets/assets.module';
import { EventsModule } from '../events/events.module';

@Module({
  imports: [ScheduleModule.forRoot(), AssetsModule, EventsModule],
  providers: [SimulatorService],
})
export class SimulatorModule {}
