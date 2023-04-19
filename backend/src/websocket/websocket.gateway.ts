import { SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { OnGatewayDisconnect, OnGatewayConnection } from '@nestjs/websockets';
import { User } from '@prisma/client';
import { io } from 'socket.io-client';
import { map } from 'rxjs';
import { Socket } from 'dgram';

@WebSocketGateway()
export class WebsocketGateway implements OnGatewayDisconnect, OnGatewayConnection {
  @WebSocketServer()
  server: Server;
  clients: Map<number, string> = new Map();

  handleConnection(client: any, ...args: any[]) {
    client.on('userConnected', (payload) => {
      const userId = payload.userId;
      if (this.clients.has(userId)) {
        this.clients.set(userId, client.id);
        return;
      }
      this.clients.set(userId, client.id);
    });
  }

  handleDisconnect(client: any) 
  {
    this.clients.delete(client.id);
  }
}