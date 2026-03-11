import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { UserRole } from '../common/enum/roles.enum';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;

  const mockUsersService = {
    createUser: jest.fn(),
    validateUser: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should call usersService.createUser', async () => {
      const newUserDto = { email: 'test@example.com', password: 'password', role: UserRole.USER as any };
      const createdUser = { id: '1', ...newUserDto };
      
      mockUsersService.createUser.mockResolvedValue(createdUser);

      const result = await service.register(newUserDto);
      
      expect(result).toEqual(createdUser);
      expect(mockUsersService.createUser).toHaveBeenCalledWith(newUserDto);
    });
  });

  describe('login', () => {
    it('should return an access token for valid credentials', async () => {
      const loginDto = { email: 'test@example.com', password: 'password' };
      const validatedUser = { id: '1', email: 'test@example.com', role: UserRole.USER };
      const expectedToken = 'signed-jwt-token';
      
      mockUsersService.validateUser.mockResolvedValue(validatedUser);
      mockJwtService.sign.mockReturnValue(expectedToken);

      const result = await service.login(loginDto);
      
      expect(result).toEqual({
        accessToken: expectedToken,
        user: {
          email: 'test@example.com',
          role: UserRole.USER,
        },
      });
      expect(mockUsersService.validateUser).toHaveBeenCalledWith(loginDto);
      expect(mockJwtService.sign).toHaveBeenCalledWith({
        sub: '1',
        email: 'test@example.com',
        role: UserRole.USER,
      });
    });

    it('should throw UnauthorizedException for invalid credentials', async () => {
      const loginDto = { email: 'wrong@example.com', password: 'password' };
      
      mockUsersService.validateUser.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('logout', () => {
    it('should return a logout message', () => {
      const result = service.logout();
      expect(result).toEqual({ message: 'Logout realizado no cliente' });
    });
  });
});
