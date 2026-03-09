import { Injectable, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { LoginDto } from '../auth/dto/login.dto';
import { RegisterDto } from '../auth/dto/register.dto';
import { UserRole } from '../common/enum/roles.enum';
import { PublicUser, User } from './entities/user.entity';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll(): Promise<PublicUser[]> {
    const users = await this.prisma.user.findMany();
    return users.map((u) => {
      // Omit passwordHash and createdAt
      const { passwordHash, createdAt, ...publicUser } = u;
      return publicUser as unknown as PublicUser;
    });
  }

  async createUser(newUser: RegisterDto): Promise<User> {
    const { email, password, role } = newUser;

    const foundUser = await this.findByEmail(email);
    if (foundUser) throw new ConflictException('Usuário com este email já existe');

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await this.prisma.user.create({
      data: {
        email,
        passwordHash,
        role: role || UserRole.USER,
      },
    });

    return user as unknown as User;
  }

  findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } }) as unknown as Promise<User | null>;
  }

  async validateUser(validateUser: LoginDto): Promise<PublicUser | null> {
    const { email, password } = validateUser;
    const user = await this.findByEmail(email);
    if (!user) return null;

    const match = await bcrypt.compare(password, user.passwordHash);
    return match ? { id: user.id, email: email, role: user.role as UserRole } : null;
  }
}
