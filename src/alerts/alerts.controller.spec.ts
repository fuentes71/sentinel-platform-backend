import { Test, TestingModule } from '@nestjs/testing';
import { AlertsController } from './alerts.controller';
import { AlertsService } from './alerts.service';

describe('AlertsController', () => {
  let controller: AlertsController;

  const mockAlertsService = {
    findAll: jest.fn(),
    findActive: jest.fn(),
    findResolved: jest.fn(),
    resolve: jest.fn(),
    hasActiveCriticalAlert: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AlertsController],
      providers: [
        {
          provide: AlertsService,
          useValue: mockAlertsService,
        },
      ],
    }).compile();

    controller = module.get<AlertsController>(AlertsController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all alerts', async () => {
      const result = [{ id: '1', assetId: '1', level: 'warning', message: 'test' }];
      mockAlertsService.findAll.mockResolvedValue(result);

      expect(await controller.findAll()).toEqual(result);
      expect(mockAlertsService.findAll).toHaveBeenCalled();
    });
  });

  describe('findActive', () => {
    it('should return active alerts', async () => {
      const result = [{ id: '1', assetId: '1', level: 'warning', message: 'test' }];
      mockAlertsService.findActive.mockResolvedValue(result);

      expect(await controller.findActive()).toEqual(result);
      expect(mockAlertsService.findActive).toHaveBeenCalled();
    });
  });

  describe('findResolved', () => {
    it('should return resolved alerts', async () => {
      const result = [{ id: '1', assetId: '1', level: 'warning', message: 'test' }];
      mockAlertsService.findResolved.mockResolvedValue(result);

      expect(await controller.findResolved()).toEqual(result);
      expect(mockAlertsService.findResolved).toHaveBeenCalled();
    });
  });

  describe('resolve', () => {
    it('should resolve an alert', async () => {
      const result = { alertId: '1', assetId: '1', resolvedAt: new Date() };
      mockAlertsService.resolve.mockResolvedValue(result);

      expect(await controller.resolve('1')).toEqual(result);
      expect(mockAlertsService.resolve).toHaveBeenCalledWith('1');
    });
  });

  describe('hasActiveCriticalAlert', () => {
    it('should check for active critical alerts', async () => {
      mockAlertsService.hasActiveCriticalAlert.mockResolvedValue(true);

      expect(await controller.hasActiveCriticalAlert('1')).toBe(true);
      expect(mockAlertsService.hasActiveCriticalAlert).toHaveBeenCalledWith('1');
    });
  });
});
