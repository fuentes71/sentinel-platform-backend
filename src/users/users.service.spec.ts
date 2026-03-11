import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';
import { ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UserRole } from '../common/enum/roles.enum';

jest.mock('bcrypt');

describe('UsersService', () => {
  let service: UsersService;
  let prisma: PrismaService;

  const mockPrismaService = {
    user: {
      findMany: jest.fn(),
      create: jest.fn(),
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of public users', async () => {
      const dbUsers = [
        { id: '1', email: 'test1@example.com', passwordHash: 'hash1', role: 'user', createdAt: new Date() },
        { id: '2', email: 'test2@example.com', passwordHash: 'hash2', role: 'admin', createdAt: new Date() },
      ];
      mockPrismaService.user.findMany.mockResolvedValue(dbUsers);

      const result = await service.findAll();
      
      expect(result).toHaveLength(2);
      expect(result[0]).not.toHaveProperty('passwordHash');
      expect(result[0]).not.toHaveProperty('createdAt');
      expect(result[0].email).toBe('test1@example.com');
    });
  });

  describe('findByEmail', () => {
    it('should return a user by email', async () => {
      const dbUser = { id: '1', email: 'test@example.com', passwordHash: 'hash', role: 'user', createdAt: new Date() };
      mockPrismaService.user.findUnique.mockResolvedValue(dbUser);

      const result = await service.findByEmail('test@example.com');
      
      expect(result).toEqual(dbUser);
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({ where: { email: 'test@example.com' } });
    });

    it('should return null if user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      const result = await service.findByEmail('test@example.com');
      
      expect(result).toBeNull();
    });
  });

  describe('createUser', () => {
    it('should create a new user successfully', async () => {
      const newUserDto = { email: 'new@example.com', password: 'password123', role: UserRole.USER as any };
      const createdUser = { id: '1', ...newUserDto, passwordHash: 'hashed_password', createdAt: new Date() };

      mockPrismaService.user.findUnique.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_password');
      mockPrismaService.user.create.mockResolvedValue(createdUser);

      const result = await service.createUser(newUserDto);

      expect(result).toEqual(createdUser);
      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
      expect(mockPrismaService.user.create).toHaveBeenCalledWith({
        data: {
          email: 'new@example.com',
          passwordHash: 'hashed_password',
          role: UserRole.USER,
        },
      });
    });

    it('should throw ConflictException if email exists', async () => {
      const newUserDto = { email: 'existing@example.com', password: 'password123', role: UserRole.USER as any };
      mockPrismaService.user.findUnique.mockResolvedValue({ id: '1', email: 'existing@example.com' });

      await expect(service.createUser(newUserDto)).rejects.toThrow(ConflictException);
    });
  });

  describe('validateUser', () => {
    it('should return user info if validation is successful', async () => {
      const dbUser = { id: '1', email: 'test@example.com', passwordHash: 'hashed_password', role: UserRole.USER, createdAt: new Date() };
      const loginDto = { email: 'test@example.com', password: 'password123' };

      mockPrismaService.user.findUnique.mockResolvedValue(dbUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.validateUser(loginDto);

      expect(result).toEqual({ id: '1', email: 'test@example.com', role: UserRole.USER });
      expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashed_password');
    });

    it('should return null if user not found', async () => {
      const loginDto = { email: 'notfound@example.com', password: 'password123' };
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      const result = await service.validateUser(loginDto);

      expect(result).toBeNull();
    });

    it('should return null if password mismatch', async () => {
      const dbUser = { id: '1', email: 'test@example.com', passwordHash: 'hashed_password', role: UserRole.USER, createdAt: new Date() };
      const loginDto = { email: 'test@example.com', password: 'wrongpassword' };

      mockPrismaService.user.findUnique.mockResolvedValue(dbUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await service.validateUser(loginDto);

      expect(result).toBeNull();
    });
  });
});
