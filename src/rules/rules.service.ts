import { Injectable } from '@nestjs/common';
import { v4 as uuid } from 'uuid';
import { Rule } from './entities/rule.entity';

@Injectable()
export class RulesService {
  private rules: Rule[] = [];

  create(rule: Omit<Rule, 'id'>): Rule {
    const newRule: Rule = {
      id: uuid(),
      ...rule,
    };

    this.rules.push(newRule);
    return newRule;
  }

  findByAsset(assetId: string): Rule[] {
    return this.rules.filter((r) => r.assetId === assetId && r.enabled);
  }

  evaluate(rule: Rule, value: number): boolean {
    switch (rule.condition) {
      case '>':
        return value > rule.threshold;
      case '<':
        return value < rule.threshold;
      case '=':
        return value === rule.threshold;
      default:
        return false;
    }
  }
}
