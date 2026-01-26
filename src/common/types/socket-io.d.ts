import { WsUser } from './ws-user.type';

declare module 'socket.io' {
  interface Socket {
    data: {
      user?: WsUser;
    };
  }
}
