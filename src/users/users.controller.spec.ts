import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  const mockUsersService = {
    findAll: jest.fn(),
    findByEmail: jest.fn(),
    createUser: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const result = [{ id: '1', email: 'test@example.com', role: 'user' }];
      mockUsersService.findAll.mockResolvedValue(result);

      expect(await controller.findAll()).toBe(result);
      expect(mockUsersService.findAll).toHaveBeenCalled();
    });
  });

  describe('findByEmail', () => {
    it('should return a user by email', async () => {
      const result = { id: '1', email: 'test@example.com', role: 'user' };
      mockUsersService.findByEmail.mockResolvedValue(result);

      expect(await controller.findByEmail('test@example.com')).toEqual(result);
      expect(mockUsersService.findByEmail).toHaveBeenCalledWith('test@example.com');
    });

    it('should throw an error if user not found', async () => {
      mockUsersService.findByEmail.mockResolvedValue(null);

      await expect(controller.findByEmail('test@example.com')).rejects.toThrow('Usuário não encontrado');
    });
  });

  describe('create', () => {
    it('should create and return a new user', async () => {
      const dto = { email: 'test@example.com', password: 'password', role: 'user' as any };
      const result = { id: '1', email: 'test@example.com', role: 'user' };
      mockUsersService.createUser.mockResolvedValue(result);

      expect(await controller.create(dto)).toBe(result);
      expect(mockUsersService.createUser).toHaveBeenCalledWith(dto);
    });
  });
});
