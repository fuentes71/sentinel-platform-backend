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
  create(@Body('name') name: string) {
    return this.assetsService.create(name);
  }

  @Get()
  findAll() {
    return this.assetsService.findAll();
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    const asset = this.assetsService.findById(id);
    if (!asset) throw new NotFoundException('Asset não encontrado');
    return asset;
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    const asset = this.assetsService.findById(id);
    if (!asset) throw new NotFoundException('Asset não encontrado');

    this.eventsService.create(id, 'status', 'offline');
    this.alertsService.removeByAsset(id);
    this.assetsService.remove(id);
  }
}
