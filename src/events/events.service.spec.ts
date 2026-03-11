import { Test, TestingModule } from '@nestjs/testing';
import { EventsService } from './events.service';
import { EventsGateway } from './events.gateway';
import { RulesService } from '../rules/rules.service';
import { AlertsService } from '../alerts/alerts.service';
import { AssetsService } from '../assets/assets.service';
import { PrismaService } from '../prisma/prisma.service';

describe('EventsService', () => {
  let service: EventsService;

  const mockGateway = {
    emitEventToAsset: jest.fn(),
    emitAlertCreatedToAsset: jest.fn(),
    emitAlertResolvedToAsset: jest.fn(),
  };

  const mockRulesService = {
    findApplicableRules: jest.fn(),
    evaluate: jest.fn(),
  };

  const mockAlertsService = {
    hasActiveCriticalAlert: jest.fn(),
    create: jest.fn(),
    resolve: jest.fn(),
  };

  const mockAssetsService = {
    findById: jest.fn(),
    updateStatus: jest.fn(),
  };

  const mockPrismaService = {
    event: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventsService,
        { provide: EventsGateway, useValue: mockGateway },
        { provide: RulesService, useValue: mockRulesService },
        { provide: AlertsService, useValue: mockAlertsService },
        { provide: AssetsService, useValue: mockAssetsService },
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<EventsService>(EventsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should return null if asset not found', async () => {
      mockAssetsService.findById.mockResolvedValue(null);

      const result = await service.create('1', 'status', 'online');
      expect(result).toBeNull();
    });

    it('should return null if asset has critical alert and event is not "status online"', async () => {
      mockAssetsService.findById.mockResolvedValue({ id: '1' });
      mockAlertsService.hasActiveCriticalAlert.mockResolvedValue(true);

      const result = await service.create('1', 'metric', 50);
      expect(result).toBeNull();
    });

    it('should create event successfully', async () => {
      const mockDate = new Date();
      jest.useFakeTimers().setSystemTime(mockDate);

      const createdEvent = {
        id: 'event-1',
        assetId: '1',
        type: 'metric' as const,
        value: '50',
        timestamp: mockDate,
      };

      mockAssetsService.findById.mockResolvedValue({ id: '1' });
      mockAlertsService.hasActiveCriticalAlert.mockResolvedValue(false);
      mockPrismaService.event.create.mockResolvedValue(createdEvent);
      mockRulesService.findApplicableRules.mockResolvedValue([]);

      const result = await service.create('1', 'metric', 50);

      expect(result).toEqual(createdEvent);
      expect(mockPrismaService.event.create).toHaveBeenCalledWith({
        data: {
          assetId: '1',
          type: 'metric',
          value: '50',
          timestamp: mockDate,
        },
      });
      expect(mockGateway.emitEventToAsset).toHaveBeenCalledWith('1', {
        eventId: 'event-1',
        assetId: '1',
        type: 'metric',
        value: 50,
        timestamp: mockDate,
      });

      jest.useRealTimers();
    });

    it('should trigger alert if rule is violated', async () => {
      const mockDate = new Date();
      jest.useFakeTimers().setSystemTime(mockDate);

      const createdEvent = { id: 'evt-1', assetId: '1', type: 'metric' as const, value: '80', timestamp: mockDate };
      const mockRule = { id: 'rule-1', level: 'warning', condition: '>', threshold: 70 };
      const mockAlert = { alertId: 'alert-1', level: 'warning', message: 'Regra violada...', createdAt: mockDate };

      mockAssetsService.findById.mockResolvedValue({ id: '1' });
      mockAlertsService.hasActiveCriticalAlert.mockResolvedValue(false);
      mockPrismaService.event.create.mockResolvedValue(createdEvent);

      mockRulesService.findApplicableRules.mockResolvedValue([mockRule]);
      mockRulesService.evaluate.mockReturnValue(true); // Rule violated
      mockAlertsService.create.mockResolvedValue(mockAlert);

      await service.create('1', 'metric', 80);

      expect(mockAlertsService.create).toHaveBeenCalledWith('1', 'warning', expect.any(String));
      expect(mockGateway.emitAlertCreatedToAsset).toHaveBeenCalledWith('1', expect.objectContaining({
        alertId: 'alert-1',
        level: 'warning',
      }));

      jest.useRealTimers();
    });
  });

  describe('resolveAlert', () => {
    it('should resolve alert and emit event', async () => {
      const mockDate = new Date();
      mockAlertsService.resolve.mockResolvedValue({ assetId: '1', resolvedAt: mockDate });

      await service.resolveAlert('alert-1', 'admin');

      expect(mockAlertsService.resolve).toHaveBeenCalledWith('alert-1');
      expect(mockGateway.emitAlertResolvedToAsset).toHaveBeenCalledWith('1', {
        alertId: 'alert-1',
        assetId: '1',
        resolvedBy: 'admin',
        resolvedAt: mockDate.toISOString(),
      });
    });
  });

  describe('find methods', () => {
    it('should find all events', async () => {
      mockPrismaService.event.findMany.mockResolvedValue([{ id: '1' }]);
      expect(await service.findAll()).toEqual([{ id: '1' }]);
    });

    it('should find events by asset', async () => {
      mockPrismaService.event.findMany.mockResolvedValue([{ id: '1' }]);
      expect(await service.findByAsset('1')).toEqual([{ id: '1' }]);
    });

    it('should find latest event by asset', async () => {
      mockPrismaService.event.findFirst.mockResolvedValue({ id: '1' });
      expect(await service.findLatestByAsset('1')).toEqual({ id: '1' });
    });
  });
});
