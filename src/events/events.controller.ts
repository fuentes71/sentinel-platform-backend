import { Controller, Get, Param } from '@nestjs/common';
import { EventsService } from './events.service';

@Controller('events')
export class EventsController {
  constructor(private readonly service: EventsService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get('asset/:assetId')
  findByAsset(@Param('assetId') assetId: string) {
    return this.service.findByAsset(assetId);
  }

  @Get('asset/:assetId/latest')
  findLatestByAsset(@Param('assetId') assetId: string) {
    return this.service.findLatestByAsset(assetId);
  }
}
