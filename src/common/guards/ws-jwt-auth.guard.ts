import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { WsUser } from '../types/ws-user.type';

type AuthenticatedSocket = Socket<
  Record<string, never>,
  Record<string, never>,
  Record<string, never>,
  { user?: WsUser }
>;

@Injectable()
export class WsJwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const client = context.switchToWs().getClient<AuthenticatedSocket>();

    console.log('[WS] autenticando cliente', client.id);
    console.log('[WS] handshake do cliente', client.handshake);

    const auth = client.handshake.auth as unknown;
    const rawToken =
      typeof auth === 'object' && auth !== null && 'token' in auth
        ? (auth as { token?: unknown }).token
        : undefined;

    if (typeof rawToken !== 'string' || rawToken.length === 0) {
      throw new WsException('Token não informado');
    }

    const token = rawToken.startsWith('Bearer ') ? rawToken.slice(7) : rawToken;

    try {
      const payload = this.jwtService.verify<{
        sub: string;
        email: string;
        role: WsUser['role'];
      }>(token);

      client.data.user = {
        id: payload.sub,
        email: payload.email,
        role: payload.role,
      };

      return true;
    } catch {
      throw new WsException('Token inválido');
    }
  }
}
