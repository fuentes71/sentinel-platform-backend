import { Test, TestingModule } from '@nestjs/testing';
import { AlertsService } from './alerts.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('AlertsService', () => {
  let service: AlertsService;

  const mockPrismaService = {
    alert: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      findFirst: jest.fn(),
      deleteMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AlertsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<AlertsService>(AlertsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new alert', async () => {
      const mockDate = new Date();
      const newAlert = { id: 'alert-1', assetId: 'asset-1', level: 'warning', message: 'test', createdAt: mockDate };

      mockPrismaService.alert.create.mockResolvedValue(newAlert);

      const result = await service.create('asset-1', 'warning', 'test');

      expect(result).toEqual({
        alertId: 'alert-1',
        assetId: 'asset-1',
        level: 'warning',
        message: 'test',
        createdAt: mockDate,
      });

      expect(mockPrismaService.alert.create).toHaveBeenCalledWith({
        data: {
          assetId: 'asset-1',
          level: 'warning',
          message: 'test',
          resolved: false,
        },
      });
    });
  });

  describe('resolve', () => {
    it('should throw NotFoundException if alert not found', async () => {
      mockPrismaService.alert.findUnique.mockResolvedValue(null);

      await expect(service.resolve('1')).rejects.toThrow(NotFoundException);
    });

    it('should resolve an alert', async () => {
      const mockDate = new Date();
      jest.useFakeTimers().setSystemTime(mockDate);

      const mockAlert = { id: '1', assetId: 'asset-1', resolved: false };
      const updatedAlert = { id: '1', assetId: 'asset-1', resolved: true, resolvedAt: mockDate };

      mockPrismaService.alert.findUnique.mockResolvedValue(mockAlert);
      mockPrismaService.alert.update.mockResolvedValue(updatedAlert);

      const result = await service.resolve('1');

      expect(result).toEqual({
        alertId: '1',
        assetId: 'asset-1',
        resolvedAt: mockDate,
      });

      expect(mockPrismaService.alert.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: {
          resolved: true,
          resolvedAt: mockDate,
        },
      });

      jest.useRealTimers();
    });
  });

  describe('find methods', () => {
    it('should find all alerts', async () => {
      mockPrismaService.alert.findMany.mockResolvedValue([{ id: '1' }]);
      expect(await service.findAll()).toEqual([{ id: '1' }]);
    });

    it('should find active alerts', async () => {
      mockPrismaService.alert.findMany.mockResolvedValue([{ id: '1' }]);
      expect(await service.findActive()).toEqual([{ id: '1' }]);
      expect(mockPrismaService.alert.findMany).toHaveBeenCalledWith({ where: { resolved: false } });
    });

    it('should find resolved alerts', async () => {
      mockPrismaService.alert.findMany.mockResolvedValue([{ id: '1' }]);
      expect(await service.findResolved()).toEqual([{ id: '1' }]);
      expect(mockPrismaService.alert.findMany).toHaveBeenCalledWith({ where: { resolved: true } });
    });
  });

  describe('hasActiveCriticalAlert', () => {
    it('should return true if active critical alert exists', async () => {
      mockPrismaService.alert.findFirst.mockResolvedValue({ id: '1' });
      expect(await service.hasActiveCriticalAlert('asset-1')).toBe(true);
      expect(mockPrismaService.alert.findFirst).toHaveBeenCalledWith({
        where: {
          assetId: 'asset-1',
          level: 'critical',
          resolved: false,
        },
      });
    });

    it('should return false if active critical alert does not exist', async () => {
      mockPrismaService.alert.findFirst.mockResolvedValue(null);
      expect(await service.hasActiveCriticalAlert('asset-1')).toBe(false);
    });
  });

  describe('removeByAsset', () => {
    it('should run deleteMany when removing by asset', async () => {
      await service.removeByAsset('asset-1');
      expect(mockPrismaService.alert.deleteMany).toHaveBeenCalledWith({
        where: { assetId: 'asset-1' },
      });
    });
  });
});
