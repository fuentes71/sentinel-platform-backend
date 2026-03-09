import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { AlertsService } from '../alerts/alerts.service';
import { EventsService } from '../events/events.service';
import { AssetsService } from './assets.service';

@Controller('assets')
@UseGuards(JwtAuthGuard)
export class AssetsController {
  constructor(
    private readonly assetsService: AssetsService,
    private readonly alertsService: AlertsService,
    private readonly eventsService: EventsService,
  ) {}

  @Post()
  async create(@Body('name') name: string) {
    return await this.assetsService.create(name);
  }

  @Get()
  async findAll() {
    return await this.assetsService.findAll();
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    const asset = await this.assetsService.findById(id);
    if (!asset) throw new NotFoundException('Asset não encontrado');
    return asset;
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    const asset = await this.assetsService.findById(id);
    if (!asset) throw new NotFoundException('Asset não encontrado');

    await this.eventsService.create(id, 'status', 'offline');
    await this.alertsService.removeByAsset(id);
    await this.assetsService.remove(id);
  }
}
