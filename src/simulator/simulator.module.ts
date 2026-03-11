import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { SimulatorService } from './simulator.service';
import { AssetsModule } from '../assets/assets.module';
import { EventsModule } from '../events/events.module';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { SimulationController } from './simulator.controller';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    AssetsModule,
    EventsModule,
    ClientsModule.register([
      {
        name: 'SIMULATION_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://localhost:5672'],
          queue: 'simulation_queue',
          queueOptions: {
            durable: false,
          },
        },
      },
    ]),
  ],
  controllers: [SimulationController],
  providers: [SimulatorService],
})
export class SimulatorModule { }
