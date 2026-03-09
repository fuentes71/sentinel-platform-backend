import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { RulesService } from './rules.service';
import { Rule } from './entities/rule.entity';

@Controller('rules')
export class RulesController {
  constructor(private readonly rulesService: RulesService) {}

  @Post()
  async create(
    @Body()
    body: Omit<Rule, 'id'>,
  ): Promise<Rule> {
    return await this.rulesService.create(body);
  }

  @Get('specific/:assetId')
  async findSpecificRules(@Param('assetId') assetId: string): Promise<Rule[]> {
    return await this.rulesService.findSpecificRules(assetId);
  }

  @Get()
  async findAll(): Promise<Rule[]> {
    return await this.rulesService.findAll();
  }

  @Patch(':id/enable')
  async enable(@Param('id') id: string): Promise<Rule | null> {
    return await this.toggle(id, true);
  }

  @Patch(':id/disable')
  async disable(@Param('id') id: string): Promise<Rule | null> {
    return await this.toggle(id, false);
  }

  private async toggle(id: string, enabled: boolean): Promise<Rule | null> {
    return await this.rulesService.toggle(id, enabled);
  }
}
