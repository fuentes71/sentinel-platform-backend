import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserRole } from '../common/enum/roles.enum';

describe('AuthController', () => {
  let controller: AuthController;
  let service: AuthService;

  const mockAuthService = {
    register: jest.fn(),
    login: jest.fn(),
    logout: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('should register a new user', async () => {
      const dto = { email: 'test@example.com', password: 'password', role: UserRole.USER };
      const expectedResult = { id: '1', email: 'test@example.com', role: UserRole.USER };
      
      mockAuthService.register.mockResolvedValue(expectedResult);

      const result = await controller.register(dto.email, dto.password, dto.role);
      
      expect(result).toEqual(expectedResult);
      expect(mockAuthService.register).toHaveBeenCalledWith(dto);
    });
  });

  describe('login', () => {
    it('should return login details', async () => {
      const dto = { email: 'test@example.com', password: 'password' };
      const expectedResult = {
        accessToken: 'token',
        user: { email: 'test@example.com', role: UserRole.USER },
      };
      
      mockAuthService.login.mockResolvedValue(expectedResult);

      const result = await controller.login(dto.email, dto.password);
      
      expect(result).toEqual(expectedResult);
      expect(mockAuthService.login).toHaveBeenCalledWith(dto);
    });
  });

  describe('logout', () => {
    it('should return logout message', () => {
      const expectedResult = { message: 'Logout realizado no cliente' };
      
      mockAuthService.logout.mockReturnValue(expectedResult);

      const result = controller.logout();
      
      expect(result).toEqual(expectedResult);
      expect(mockAuthService.logout).toHaveBeenCalled();
    });
  });
});
