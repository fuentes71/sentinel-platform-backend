import { Test, TestingModule } from '@nestjs/testing';
import { RulesService } from './rules.service';
import { PrismaService } from '../prisma/prisma.service';
import { Rule } from './entities/rule.entity';

describe('RulesService', () => {
  let service: RulesService;

  const mockPrismaService = {
    rule: {
      create: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RulesService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<RulesService>(RulesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new rule', async () => {
      const dto: Omit<Rule, 'id'> = { assetId: '1', condition: '>', threshold: 10, enabled: true, level: 'medium' };
      const createdRule: Rule = { id: 'rule-1', ...dto };

      mockPrismaService.rule.create.mockResolvedValue(createdRule);

      const result = await service.create(dto);

      expect(result).toEqual(createdRule);
      expect(mockPrismaService.rule.create).toHaveBeenCalledWith({
        data: {
          assetId: '1',
          condition: '>',
          threshold: 10,
          enabled: true,
          level: 'medium',
        },
      });
    });

    it('should respect provided enabled and level values', async () => {
      const dto: Omit<Rule, 'id'> = { assetId: '1', condition: '>', threshold: 10, enabled: false, level: 'strong' };
      const createdRule: Rule = { id: 'rule-1', ...dto };

      mockPrismaService.rule.create.mockResolvedValue(createdRule);

      const result = await service.create(dto);

      expect(result).toEqual(createdRule);
      expect(mockPrismaService.rule.create).toHaveBeenCalledWith({
        data: {
          assetId: '1',
          condition: '>',
          threshold: 10,
          enabled: false,
          level: 'strong',
        },
      });
    });
  });

  describe('find functions', () => {
    it('should find all rules', async () => {
      const expected = [{ id: '1' }];
      mockPrismaService.rule.findMany.mockResolvedValue(expected);

      expect(await service.findAll()).toEqual(expected);
      expect(mockPrismaService.rule.findMany).toHaveBeenCalled();
    });

    it('should find applicable rules (global and specific)', async () => {
      const expected = [{ id: '1' }];
      mockPrismaService.rule.findMany.mockResolvedValue(expected);

      expect(await service.findApplicableRules('asset-1')).toEqual(expected);
      expect(mockPrismaService.rule.findMany).toHaveBeenCalledWith({
        where: {
          enabled: true,
          OR: [
            { assetId: 'asset-1' },
            { assetId: null },
          ],
        },
      });
    });

    it('should find specific rules', async () => {
      const expected = [{ id: '1' }];
      mockPrismaService.rule.findMany.mockResolvedValue(expected);

      expect(await service.findSpecificRules('asset-1')).toEqual(expected);
      expect(mockPrismaService.rule.findMany).toHaveBeenCalledWith({
        where: {
          assetId: 'asset-1',
          enabled: true,
        },
      });
    });
  });

  describe('evaluate', () => {
    it('should evaluate > correctly', () => {
      const rule: Rule = { condition: '>', threshold: 50, id: '1', assetId: '1', level: 'medium', enabled: true };
      expect(service.evaluate(rule, 60)).toBe(true);
      expect(service.evaluate(rule, 40)).toBe(false);
    });

    it('should evaluate < correctly', () => {
      const rule: Rule = { condition: '<', threshold: 50, id: '1', assetId: '1', level: 'medium', enabled: true };
      expect(service.evaluate(rule, 40)).toBe(true);
      expect(service.evaluate(rule, 60)).toBe(false);
    });

    it('should evaluate = correctly', () => {
      const rule: Rule = { condition: '=', threshold: 50, id: '1', assetId: '1', level: 'medium', enabled: true };
      expect(service.evaluate(rule, 50)).toBe(true);
      expect(service.evaluate(rule, 40)).toBe(false);
    });

    it('should return false for unknown condition', () => {
      const rule = { condition: 'unknown' as any, threshold: 50, id: '1', assetId: '1', level: 'medium', enabled: true } as Rule;
      expect(service.evaluate(rule, 50)).toBe(false);
    });
  });

  describe('toggle', () => {
    it('should toggle rule state', async () => {
      const expected = { id: '1', enabled: false };
      mockPrismaService.rule.update.mockResolvedValue(expected);

      expect(await service.toggle('1', false)).toEqual(expected);
      expect(mockPrismaService.rule.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { enabled: false },
      });
    });

    it('should return null on error', async () => {
      mockPrismaService.rule.update.mockRejectedValue(new Error('DB Error'));

      expect(await service.toggle('1', false)).toBeNull();
    });
  });
});
