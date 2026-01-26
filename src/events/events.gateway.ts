import { Injectable, UseGuards } from '@nestjs/common';
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
import { WsJwtAuthGuard } from '../common/guards/ws-jwt-auth.guard';
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
  cors: { origin: '*' },
})
@UseGuards(WsJwtAuthGuard)
@Injectable()
export class EventsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private server!: Server<ServerToClientEvents>;

  afterInit(server: Server<ServerToClientEvents>): void {
    this.server = server;
  }

  handleConnection(client: AuthenticatedSocket): void {
    console.log('[WS] conectado:', client.id);
  }

  handleDisconnect(client: AuthenticatedSocket): void {
    console.log(`[WS] desconectado → ${client.data.user?.email ?? 'sem user'}`);
  }

  @SubscribeMessage('subscribe-asset')
  handleSubscribeAsset(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() assetId: string,
  ): void {
    client.join(`asset:${assetId}`);
  }

  emitEventToAsset(assetId: string, payload: AssetEventPayload): void {
    this.server.to(`asset:${assetId}`).emit('asset-event', payload);
  }

  emitAlertResolvedToAsset(
    assetId: string,
    payload: AlertResolvedPayload,
  ): void {
    this.server.to(`asset:${assetId}`).emit('alert-resolved', payload);
  }
}
