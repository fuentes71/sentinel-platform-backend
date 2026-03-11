import { Test, TestingModule } from '@nestjs/testing';
import { AssetsController } from './assets.controller';
import { AssetsService } from './assets.service';
import { AlertsService } from '../alerts/alerts.service';
import { EventsService } from '../events/events.service';
import { NotFoundException } from '@nestjs/common';

describe('AssetsController', () => {
  let controller: AssetsController;

  const mockAssetsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    remove: jest.fn(),
  };

  const mockAlertsService = {
    removeByAsset: jest.fn(),
  };

  const mockEventsService = {
    create: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AssetsController],
      providers: [
        { provide: AssetsService, useValue: mockAssetsService },
        { provide: AlertsService, useValue: mockAlertsService },
        { provide: EventsService, useValue: mockEventsService },
      ],
    }).compile();

    controller = module.get<AssetsController>(AssetsController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create an asset', async () => {
      const asset = { id: '1', name: 'Test Asset' };
      mockAssetsService.create.mockResolvedValue(asset);

      expect(await controller.create('Test Asset')).toBe(asset);
      expect(mockAssetsService.create).toHaveBeenCalledWith('Test Asset');
    });
  });

  describe('findAll', () => {
    it('should return all assets', async () => {
      const assets = [{ id: '1', name: 'Test Asset' }];
      mockAssetsService.findAll.mockResolvedValue(assets);

      expect(await controller.findAll()).toBe(assets);
      expect(mockAssetsService.findAll).toHaveBeenCalled();
    });
  });

  describe('findById', () => {
    it('should return an asset by id', async () => {
      const asset = { id: '1', name: 'Test Asset' };
      mockAssetsService.findById.mockResolvedValue(asset);

      expect(await controller.findById('1')).toBe(asset);
      expect(mockAssetsService.findById).toHaveBeenCalledWith('1');
    });

    it('should throw NotFoundException if asset not found', async () => {
      mockAssetsService.findById.mockResolvedValue(null);

      await expect(controller.findById('1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove an asset and its related data', async () => {
      mockAssetsService.findById.mockResolvedValue({ id: '1', name: 'Test Asset' });

      await controller.remove('1');

      expect(mockEventsService.create).toHaveBeenCalledWith('1', 'status', 'offline');
      expect(mockAlertsService.removeByAsset).toHaveBeenCalledWith('1');
      expect(mockAssetsService.remove).toHaveBeenCalledWith('1');
    });

    it('should throw NotFoundException if asset not found on remove', async () => {
      mockAssetsService.findById.mockResolvedValue(null);

      await expect(controller.remove('1')).rejects.toThrow(NotFoundException);
    });
  });
});
