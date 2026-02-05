import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(newUser: RegisterDto) {
    return this.usersService.createUser(newUser);
  }

  async login(authRequest: LoginDto) {
    const user = await this.usersService.validateUser(authRequest);

    if (!user) throw new UnauthorizedException('Credenciais inválidas');

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        email: user.email,
        role: user.role,
      },
    };
  }

  logout() {
    return { message: 'Logout realizado no cliente' };
  }
}
