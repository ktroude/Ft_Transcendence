// websocket.gateway.ts

import { SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { OnGatewayDisconnect, OnGatewayConnection } from '@nestjs/websockets';
import { User } from '@prisma/client';
import { io } from 'socket.io-client';

@WebSocketGateway()
export class WebsocketGateway implements OnGatewayDisconnect, OnGatewayConnection {
  @WebSocketServer()
  server: Server;
  clients: Map<string, number> = new Map()

  handleConnection(client: any, ...args: any[]) {
    console.log(`Client connected: ${client.id}`);

      client.on('userConnected', (payload) => {
      const userId = payload.userId;
      client.id = userId;
      console.log(`User connected with ID ${client.id}`);
    });
  }


  handleDisconnect(client: any) {
    for (const [id, c] of this.clients.entries()) {
      if (c === client) {
        this.clients.delete(id); 
        console.log(`Client disconnected: ${id}`);
        break;
      }
    }
  }
}
