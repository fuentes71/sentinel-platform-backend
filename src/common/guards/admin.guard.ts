import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { ADMIN_ONLY_KEY } from '../decorators/admin-only.decorator';
import { UserRole } from '../enum/roles.enum';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isAdminOnly = this.reflector.getAllAndOverride<boolean>(
      ADMIN_ONLY_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!isAdminOnly) return true;

    const request = context.switchToHttp().getRequest<Request>();
    const user = request.user as { role?: UserRole } | undefined;

    if (!user || user.role !== UserRole.ADMIN)
      throw new ForbiddenException(
        'Acesso permitido apenas para administradores.',
      );

    return true;
  }
}
