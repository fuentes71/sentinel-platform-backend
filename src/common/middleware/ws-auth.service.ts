import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { WsUser } from '../types/ws-user.type';
import { AuthenticatedSocket } from '../../events/events.gateway';

type WsHandshakeAuth = {
  token?: string;
};

@Injectable()
export class WsAuthService {
  constructor(private readonly jwtService: JwtService) {}

  authenticate(client: AuthenticatedSocket): WsUser {
    const auth = client.handshake.auth as WsHandshakeAuth;

    const rawToken = auth?.token;

    if (!rawToken || typeof rawToken !== 'string') {
      throw new Error('Token ausente no handshake.auth.token');
    }

    const token = rawToken.startsWith('Bearer ') ? rawToken.slice(7) : rawToken;

    const payload = this.jwtService.verify<{
      sub: string;
      email: string;
      role: WsUser['role'];
    }>(token);

    return {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
    };
  }
}
