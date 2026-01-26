import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { LoginDto } from '../auth/dto/login.dto';
import { RegisterDto } from '../auth/dto/register.dto';
import { UserRole } from '../common/enum/roles.enum';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  private users: User[] = [];

  constructor() {
    // User default admin tester
    void this.createUser({
      email: 'admin@sentinel.com',
      password: 'admin123',
      role: UserRole.ADMIN,
    });
  }

  async createUser(newUser: RegisterDto): Promise<User> {
    const { email, password, role } = newUser;

    const foundUser = await this.findByEmail(email);
    if (foundUser) throw new Error('Usuário com este email já existe');

    const passwordHash = await bcrypt.hash(password, 10);

    const user: User = {
      id: uuidv4(),
      email,
      passwordHash,
      role,
    };

    this.users.push(user);
    return user;
  }

  findByEmail(email: string): Promise<User | undefined> {
    return Promise.resolve(this.users.find((u) => u.email === email));
  }

  async validateUser(validateUser: LoginDto): Promise<User | null> {
    const { email, password } = validateUser;
    const user = await this.findByEmail(email);
    if (!user) return null;

    const match = await bcrypt.compare(password, user.passwordHash);
    return match ? user : null;
  }
}
