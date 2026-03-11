import { Test, TestingModule } from '@nestjs/testing';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';

describe('EventsController', () => {
  let controller: EventsController;

  const mockEventsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findByAsset: jest.fn(),
    findLatestByAsset: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EventsController],
      providers: [
        {
          provide: EventsService,
          useValue: mockEventsService,
        },
      ],
    }).compile();

    controller = module.get<EventsController>(EventsController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create an event', async () => {
      const dto = { assetId: '1', type: 'status' as const, value: 'online' };
      const result = { id: '1', ...dto, timestamp: new Date() };

      mockEventsService.create.mockResolvedValue(result);

      expect(await controller.create(dto)).toEqual(result);
      expect(mockEventsService.create).toHaveBeenCalledWith(dto.assetId, dto.type, dto.value);
    });
  });

  describe('findAll', () => {
    it('should return all events', async () => {
      const result = [{ id: '1', assetId: '1', type: 'status', value: 'online', timestamp: new Date() }];

      mockEventsService.findAll.mockResolvedValue(result);

      expect(await controller.findAll()).toEqual(result);
      expect(mockEventsService.findAll).toHaveBeenCalled();
    });
  });

  describe('findByAsset', () => {
    it('should return events for a specific asset', async () => {
      const result = [{ id: '1', assetId: '1', type: 'status', value: 'online', timestamp: new Date() }];

      mockEventsService.findByAsset.mockResolvedValue(result);

      expect(await controller.findByAsset('1')).toEqual(result);
      expect(mockEventsService.findByAsset).toHaveBeenCalledWith('1');
    });
  });

  describe('findLatestByAsset', () => {
    it('should return the latest event for a specific asset', async () => {
      const result = { id: '1', assetId: '1', type: 'status', value: 'online', timestamp: new Date() };

      mockEventsService.findLatestByAsset.mockResolvedValue(result);

      expect(await controller.findLatestByAsset('1')).toEqual(result);
      expect(mockEventsService.findLatestByAsset).toHaveBeenCalledWith('1');
    });
  });
});
