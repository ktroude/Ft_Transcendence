// websocket.gateway.ts

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
  clients: Map<string, number> = new Map()

  handleConnection(client: any, ...args: any[]) {
    console.log(`Client connected: ${client.id}`);

      client.on('userConnected', (payload) => {
      if (this.clients.has(client.id) == true)
      {
        console.log("User already connected");
      }
      console.log(`User connected with ID ${payload.userId}`);
      this.clients.set(client.id, payload.userId);
    });
  }

  handleDisconnect(client: any) 
  {
    this.clients.delete(client.id);
    console.log(`Client disconnected: ${client.id}`);
  }
}
