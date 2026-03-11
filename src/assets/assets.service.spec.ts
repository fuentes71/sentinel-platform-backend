import { Test, TestingModule } from '@nestjs/testing';
import { AssetsService } from './assets.service';
import { PrismaService } from '../prisma/prisma.service';
import { BadRequestException } from '@nestjs/common';

describe('AssetsService', () => {
  let service: AssetsService;
  let prisma: PrismaService;

  const mockPrismaService = {
    asset: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AssetsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<AssetsService>(AssetsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should throw error if name is missing', async () => {
      await expect(service.create('  ')).rejects.toThrow(BadRequestException);
    });

    it('should create an asset', async () => {
      const asset = { id: '1', name: 'Test Asset', status: 'online' };
      mockPrismaService.asset.create.mockResolvedValue(asset);

      const result = await service.create('Test Asset');
      expect(result).toEqual(asset);
      expect(mockPrismaService.asset.create).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return an array of assets', async () => {
      const assets = [{ id: '1', name: 'Test Asset' }];
      mockPrismaService.asset.findMany.mockResolvedValue(assets);

      expect(await service.findAll()).toEqual(assets);
      expect(mockPrismaService.asset.findMany).toHaveBeenCalled();
    });
  });

  describe('findById', () => {
    it('should return a specific asset', async () => {
      const asset = { id: '1', name: 'Test Asset' };
      mockPrismaService.asset.findUnique.mockResolvedValue(asset);

      expect(await service.findById('1')).toEqual(asset);
      expect(mockPrismaService.asset.findUnique).toHaveBeenCalledWith({ where: { id: '1' } });
    });

    it('should return null if not found', async () => {
      mockPrismaService.asset.findUnique.mockResolvedValue(null);

      expect(await service.findById('1')).toBeNull();
    });
  });

  describe('updateStatus', () => {
    it('should update asset status', async () => {
      const asset = { id: '1', status: 'offline' };
      mockPrismaService.asset.update.mockResolvedValue(asset);

      const result = await service.updateStatus('1', 'offline');
      expect(result).toEqual(asset);
      expect(mockPrismaService.asset.update).toHaveBeenCalled();
    });

    it('should return null on error', async () => {
      mockPrismaService.asset.update.mockRejectedValue(new Error('DB Error'));

      expect(await service.updateStatus('1', 'offline')).toBeNull();
    });
  });

  describe('remove', () => {
    it('should remove an asset', async () => {
      await service.remove('1');
      expect(mockPrismaService.asset.delete).toHaveBeenCalledWith({ where: { id: '1' } });
    });

    it('should ignore errors during removal', async () => {
      mockPrismaService.asset.delete.mockRejectedValue(new Error('Error'));
      await expect(service.remove('1')).resolves.not.toThrow();
    });
  });
});
