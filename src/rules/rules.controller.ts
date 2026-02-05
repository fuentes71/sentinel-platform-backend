import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { RulesService } from './rules.service';
import { Rule } from './entities/rule.entity';

@Controller('rules')
export class RulesController {
  constructor(private readonly rulesService: RulesService) {}

  @Post()
  create(
    @Body()
    body: Omit<Rule, 'id'>,
  ): Rule {
    return this.rulesService.create(body);
  }

  @Get('specific/:assetId')
  findSpecificRules(@Param('assetId') assetId: string): Rule[] {
    return this.rulesService.findSpecificRules(assetId);
  }

  @Get()
  findAll(): Rule[] {
    return this.rulesService.findAll();
  }

  @Patch(':id/enable')
  enable(@Param('id') id: string): Rule | null {
    return this.toggle(id, true);
  }

  @Patch(':id/disable')
  disable(@Param('id') id: string): Rule | null {
    return this.toggle(id, false);
  }

  private toggle(id: string, enabled: boolean): Rule | null {
    const rules = (this.rulesService as unknown as { rules: Rule[] }).rules;
    const rule = rules.find((r) => r.id === id);

    if (!rule) return null;

    rule.enabled = enabled;
    return rule;
  }
}
