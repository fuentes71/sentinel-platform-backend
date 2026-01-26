import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { Public } from '../common/decorators/public.decorator';
import { AuthService } from './auth.service';
import { AdminOnly } from '../common/decorators/admin-only.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { AdminGuard } from '../common/guards/admin.guard';
import { UserRole } from '../common/enum/roles.enum';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(JwtAuthGuard, AdminGuard)
  @AdminOnly()
  @Post('register')
  register(
    @Body('email') email: string,
    @Body('password') password: string,
    @Body('role') role: UserRole,
  ) {
    return this.authService.register({ email, password, role });
  }

  @Public()
  @Post('login')
  login(@Body('email') email: string, @Body('password') password: string) {
    return this.authService.login({ email, password });
  }

  @Post('logout')
  logout() {
    return this.authService.logout();
  }
}
