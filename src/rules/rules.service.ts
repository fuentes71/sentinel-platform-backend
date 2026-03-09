import { Injectable } from '@nestjs/common';
import { Rule } from './entities/rule.entity';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RulesService {
  constructor(private prisma: PrismaService) {}

  async create(rule: Omit<Rule, 'id'>): Promise<Rule> {
    const { enabled, level, assetId, condition, threshold } = rule;

    const newRule = await this.prisma.rule.create({
      data: {
        assetId,
        condition,
        threshold,
        enabled: enabled ?? true,
        level: level ?? 'medium',
      },
    });
    
    return newRule as Rule;
  }

  async findAll(): Promise<Rule[]> {
    return (await this.prisma.rule.findMany()) as Rule[];
  }

  async findApplicableRules(assetId: string): Promise<Rule[]> {
    const rules = await this.prisma.rule.findMany({
      where: {
        enabled: true,
        OR: [
          { assetId: assetId },
          { assetId: null }
        ]
      }
    });
    return rules as Rule[];
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

  async findSpecificRules(assetId: string): Promise<Rule[]> {
    const rules = await this.prisma.rule.findMany({
      where: {
        assetId: assetId,
        enabled: true
      }
    });
    return rules as Rule[];
  }

  async toggle(id: string, enabled: boolean): Promise<Rule | null> {
    try {
      const rule = await this.prisma.rule.update({
        where: { id },
        data: { enabled }
      });
      return rule as Rule;
    } catch {
      return null;
    }
  }
}
