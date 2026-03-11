import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { AlertCreatedPayload } from '../alerts/dto/alert-created.dto';
import { AlertResolvedPayload } from '../alerts/dto/alert-resolved.dto';
import { UserRole } from '../common/enum/roles.enum';
import { WsAuthService } from '../common/middleware/ws-auth.service';
import { WsUser } from '../common/types/ws-user.type';
import { AssetEventPayload } from './dto/asset-event.payload';

export type AuthenticatedSocket = Socket<
  Record<string, never>,
  Record<string, never>,
  Record<string, never>,
  { user?: WsUser }
>;

interface ServerToClientEvents {
  'asset-event': (payload: AssetEventPayload) => void;
  'alert-created': (payload: AlertCreatedPayload) => void;
  'alert-resolved': (payload: AlertResolvedPayload) => void;
}

@WebSocketGateway({
  namespace: '/events',
  cors: {
    origin: process.env.CORS_ORIGIN
      ? process.env.CORS_ORIGIN.split(',')
      : ['http://localhost:4200'],
    credentials: true,
  },
})
@Injectable()
export class EventsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private server!: Server<ServerToClientEvents>;

  constructor(
    private readonly jwtService: JwtService,
    private readonly wsAuth: WsAuthService,
  ) {}

  afterInit(server: Server) {
    this.server = server;

    server.use((client: AuthenticatedSocket, next) => {
      try {
        const user = this.wsAuth.authenticate(client);
        client.data.user = user;
        return next();
      } catch (err) {
        return next(new Error(err));
      }
    });
  }

  handleConnection(client: AuthenticatedSocket): void {
    console.log('[WS] conectado:', client.id);
    console.log('[WS] user:', client.data.user);
  }

  handleDisconnect(client: AuthenticatedSocket): void {
    console.log(`[WS] desconectado → ${client.data.user?.email ?? 'sem user'}`);
  }

  @SubscribeMessage('subscribe-asset')
  handleSubscribeAsset(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() assetId: string,
  ): { success: true } {
    if (!assetId) return { success: true };

    client.join(`asset:${assetId}`);

    console.log(
      `[WS] ${client.data.user?.email ?? client.id} assinou asset:${assetId}`,
    );

    return { success: true };
  }

  @SubscribeMessage('unsubscribe-asset')
  handleUnsubscribeAsset(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() assetId: string,
  ): { success: true } {
    if (!assetId) return { success: true };

    client.leave(`asset:${assetId}`);

    console.log(
      `[WS] ${client.data.user?.email ?? client.id} saiu de asset:${assetId}`,
    );

    return { success: true };
  }

  @SubscribeMessage('subscribe-all-assets')
  handleSubscribeAllAssets(@ConnectedSocket() client: AuthenticatedSocket): {
    success: true;
  } {
    const user = client.data.user;

    if (!user) return { success: true };

    if (user.role !== UserRole.ADMIN) {
      console.log(
        `[WS] ${user.email} tentou subscribe-all-assets sem permissão`,
      );
      return { success: true };
    }

    client.join('admin:all-assets');

    console.log(`[WS] admin ${user.email} assinou TODOS assets`);

    return { success: true };
  }

  emitEventToAsset(assetId: string, payload: AssetEventPayload): void {
    console.log(assetId, payload);
    this.server.to(`asset:${assetId}`).emit('asset-event', payload);
    this.server.to('admin:all-assets').emit('asset-event', payload);
  }

  emitAlertCreatedToAsset(assetId: string, payload: AlertCreatedPayload): void {
    this.server.to(`asset:${assetId}`).emit('alert-created', payload);
    this.server.to('admin:all-assets').emit('alert-created', payload);
  }

  emitAlertResolvedToAsset(
    assetId: string,
    payload: AlertResolvedPayload,
  ): void {
    this.server.to(`asset:${assetId}`).emit('alert-resolved', payload);
    this.server.to('admin:all-assets').emit('alert-resolved', payload);
  }
}
