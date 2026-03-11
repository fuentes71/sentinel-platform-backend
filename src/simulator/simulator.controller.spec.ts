import { Test, TestingModule } from '@nestjs/testing';
import { SimulationController } from './simulator.controller';
import { EventsService } from '../events/events.service';
import { Logger } from '@nestjs/common';
import { Asset } from '../assets/entities/asset.entity';

describe('SimulationController', () => {
  let controller: SimulationController;
  let eventsService: EventsService;

  const mockEventsService = {
    create: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SimulationController],
      providers: [
        {
          provide: EventsService,
          useValue: mockEventsService,
        },
      ],
    }).compile();

    controller = module.get<SimulationController>(SimulationController);
    eventsService = module.get<EventsService>(EventsService);

    // Suppress logger output during tests
    jest.spyOn(Logger.prototype, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('handleSimulateAsset', () => {
    it('should calculate and emit a new metric for the asset', async () => {
      const asset: Asset = { id: 'asset-1', name: 'Test Asset', status: 'online', lastUpdate: new Date() };

      // Mock randomBetween to return a predictable value
      const randomSpy = jest.spyOn(controller as any, 'randomBetween').mockReturnValue(50);

      await controller.handleSimulateAsset(asset);

      // Verify that eventsService.create was called correctly
      expect(mockEventsService.create).toHaveBeenCalledWith('asset-1', 'metric', expect.any(Number));
      
      const callArgs = mockEventsService.create.mock.calls[0];
      const metricValue = callArgs[2];
      
      expect(metricValue).toBeGreaterThanOrEqual(0);
      expect(metricValue).toBeLessThanOrEqual(100);

      randomSpy.mockRestore();
    });

    it('should keep metrics within 0-100 bounds', async () => {
      const asset1: Asset = { id: 'asset-1', name: 'Test Asset', status: 'online', lastUpdate: new Date() };

      // Force metric to go below 0
      jest.spyOn(controller as any, 'randomBetween')
        .mockReturnValueOnce(5)   // initial metric
        .mockReturnValueOnce(-10); // variation

      await controller.handleSimulateAsset(asset1);
      expect(mockEventsService.create).toHaveBeenCalledWith('asset-1', 'metric', 0); // clamped to 0

      const asset2: Asset = { id: 'asset-2', name: 'Test Asset 2', status: 'online', lastUpdate: new Date() };

      // Force metric to go above 100
      jest.spyOn(controller as any, 'randomBetween')
        .mockReturnValueOnce(95)   // initial metric
        .mockReturnValueOnce(10);  // variation

      await controller.handleSimulateAsset(asset2);
      expect(mockEventsService.create).toHaveBeenCalledWith('asset-2', 'metric', 100); // clamped to 100
    });
  });
});
