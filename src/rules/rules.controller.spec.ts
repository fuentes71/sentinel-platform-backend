import { Test, TestingModule } from '@nestjs/testing';
import { RulesController } from './rules.controller';
import { RulesService } from './rules.service';

describe('RulesController', () => {
  let controller: RulesController;

  const mockRulesService = {
    create: jest.fn(),
    findSpecificRules: jest.fn(),
    findAll: jest.fn(),
    toggle: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RulesController],
      providers: [
        {
          provide: RulesService,
          useValue: mockRulesService,
        },
      ],
    }).compile();

    controller = module.get<RulesController>(RulesController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new rule', async () => {
      const dto = {
        assetId: '1',
        condition: '>',
        threshold: 10,
        enabled: true,
        level: 'medium'
      };
      const expectedResult = { id: '1', ...dto };

      mockRulesService.create.mockResolvedValue(expectedResult);

      expect(await controller.create(dto)).toEqual(expectedResult);
      expect(mockRulesService.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('findSpecificRules', () => {
    it('should return specific rules for an asset', async () => {
      const result = [{ id: '1', assetId: '1', condition: '>', threshold: 10, enabled: true, level: 'medium' }];

      mockRulesService.findSpecificRules.mockResolvedValue(result);

      expect(await controller.findSpecificRules('1')).toEqual(result);
      expect(mockRulesService.findSpecificRules).toHaveBeenCalledWith('1');
    });
  });

  describe('findAll', () => {
    it('should return all rules', async () => {
      const result = [{ id: '1', assetId: '1', condition: '>', threshold: 10, enabled: true, level: 'medium' }];

      mockRulesService.findAll.mockResolvedValue(result);

      expect(await controller.findAll()).toEqual(result);
      expect(mockRulesService.findAll).toHaveBeenCalled();
    });
  });

  describe('enable/disable toggle', () => {
    it('should enable a rule', async () => {
      const result = { id: '1', enabled: true };
      mockRulesService.toggle.mockResolvedValue(result);

      expect(await controller.enable('1')).toEqual(result);
      expect(mockRulesService.toggle).toHaveBeenCalledWith('1', true);
    });

    it('should disable a rule', async () => {
      const result = { id: '1', enabled: false };
      mockRulesService.toggle.mockResolvedValue(result);

      expect(await controller.disable('1')).toEqual(result);
      expect(mockRulesService.toggle).toHaveBeenCalledWith('1', false);
    });
  });
});
