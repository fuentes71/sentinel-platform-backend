import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { AssetsService } from './assets.service';

@Controller('assets')
export class AssetsController {
  constructor(private readonly service: AssetsService) {}

  @Post()
  create(@Body('name') name: string) {
    return this.service.create(name);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    this.service.remove(id);
  }
}
