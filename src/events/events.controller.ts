import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { EventsService } from './events.service';

@Controller('events')
export class EventsController {
  constructor(private readonly service: EventsService) {}

  @Post()
  create(
    @Body() body: { assetId: string; type: 'status' | 'metric'; value: any },
  ) {
    return this.service.create(body.assetId, body.type, body.value);
  }

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
