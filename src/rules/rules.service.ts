import { Injectable } from '@nestjs/common';
import { v4 as uuid } from 'uuid';
import { Rule } from './entities/rule.entity';
@Injectable()
export class RulesService {
  private rules: Rule[] = [];

  create(rule: Omit<Rule, 'id'>): Rule {
    const { enabled, level, ...rest } = rule;

    const newRule: Rule = {
      id: uuid(),
      enabled: enabled ?? true,
      level: level ?? 'medium',
      ...rest,
    };

    this.rules.push(newRule);
    return newRule;
  }

  findAll(): Rule[] {
    return this.rules;
  }

  findApplicableRules(assetId: string): Rule[] {
    return this.rules.filter((rule) => {
      if (!rule.enabled) return false;
      if (!rule.assetId) return true;
      return rule.assetId === assetId;
    });
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

  findSpecificRules(assetId: string): Rule[] {
    return this.rules.filter((r) => r.assetId === assetId && r.enabled);
  }
}
