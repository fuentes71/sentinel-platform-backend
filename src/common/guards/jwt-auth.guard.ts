import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    return super.canActivate(context);
  }

  handleRequest<TUser = any>(
    err: any,
    user: TUser | null,
    info: any,
    context: ExecutionContext,
    status?: any,
  ): TUser {
    void info;
    void status;
    void context;

    if (err || !user) {
      const errorToThrow =
        err instanceof Error
          ? err
          : new UnauthorizedException('Token inválido ou ausente');
      throw errorToThrow;
    }

    return user as TUser;
  }
}
