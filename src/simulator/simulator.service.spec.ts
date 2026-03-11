import { Test, TestingModule } from '@nestjs/testing';
import { SimulatorService } from './simulator.service';
import { AssetsService } from '../assets/assets.service';
import { ClientProxy } from '@nestjs/microservices';
import { Asset } from '../assets/entities/asset.entity';

describe('SimulatorService', () => {
  let service: SimulatorService;

  const mockAssetsService = {
    findAll: jest.fn(),
  };

  const mockClientProxy = {
    emit: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SimulatorService,
        {
          provide: AssetsService,
          useValue: mockAssetsService,
        },
        {
          provide: 'SIMULATION_SERVICE',
          useValue: mockClientProxy,
        },
      ],
    }).compile();

    service = module.get<SimulatorService>(SimulatorService);
    
    // Suppress console.log during tests
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('simulate', () => {
    it('should find all assets and emit a "simulate_asset" event for each', async () => {
      const assets: Asset[] = [
        { id: '1', name: 'Asset 1', status: 'online', lastUpdate: new Date() },
        { id: '2', name: 'Asset 2', status: 'offline', lastUpdate: new Date() },
      ];

      mockAssetsService.findAll.mockResolvedValue(assets);

      await service.simulate();

      expect(mockAssetsService.findAll).toHaveBeenCalled();
      expect(mockClientProxy.emit).toHaveBeenCalledTimes(2);
      expect(mockClientProxy.emit).toHaveBeenNthCalledWith(1, 'simulate_asset', assets[0]);
      expect(mockClientProxy.emit).toHaveBeenNthCalledWith(2, 'simulate_asset', assets[1]);
    });

    it('should not emit events if there are no assets', async () => {
      mockAssetsService.findAll.mockResolvedValue([]);

      await service.simulate();

      expect(mockAssetsService.findAll).toHaveBeenCalled();
      expect(mockClientProxy.emit).not.toHaveBeenCalled();
    });
  });
});
