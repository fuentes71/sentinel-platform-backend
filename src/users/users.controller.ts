import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { RegisterDto } from '../auth/dto/register.dto';
import { AdminOnly } from '../common/decorators/admin-only.decorator';
import { AdminGuard } from '../common/guards/admin.guard';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { UsersService } from './users.service';
import { PublicUser } from './entities/user.entity';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @AdminOnly()
  @UseGuards(AdminGuard)
  async findAll(): Promise<PublicUser[]> {
    return await this.usersService.findAll();
  }

  @Get(':email')
  @AdminOnly()
  @UseGuards(AdminGuard)
  async findByEmail(@Param('email') email: string): Promise<PublicUser> {
    const user = await this.usersService.findByEmail(email);

    if (!user) throw new Error('Usuário não encontrado');

    return {
      id: user.id,
      email: user.email,
      role: user.role,
    };
  }

  @Post()
  @AdminOnly()
  @UseGuards(AdminGuard)
  async create(@Body() body: RegisterDto): Promise<PublicUser> {
    return await this.usersService.createUser(body);
  }
}
