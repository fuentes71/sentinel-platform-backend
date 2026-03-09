import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { EventsService } from './events.service';

@Controller('events')
export class EventsController {
  constructor(private readonly service: EventsService) {}

  @Post()
  async create(
    @Body() body: { assetId: string; type: 'status' | 'metric'; value: any },
  ) {
    return await this.service.create(body.assetId, body.type, body.value);
  }

  @Get()
  async findAll() {
    return await this.service.findAll();
  }

  @Get('asset/:assetId')
  async findByAsset(@Param('assetId') assetId: string) {
    return await this.service.findByAsset(assetId);
  }

  @Get('asset/:assetId/latest')
  async findLatestByAsset(@Param('assetId') assetId: string) {
    return await this.service.findLatestByAsset(assetId);
  }
}
