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
  clients: Map<string, string> = new Map();

  handleConnection(client: any, ...args: any[]) {
    client.on('userConnected', (payload) => {
      const pseudo = payload.pseudo;
      if (this.clients.has(pseudo)) {
        this.clients.set(pseudo, client.id);
        return;
      }
      this.clients.set(pseudo, client.id);
    });
  }

  handleDisconnect(client: any) 
  {
    this.clients.delete(client.id);
  }
  
  async getClient() {
	const newmap = this.clients;
	const vector = [];
	console.log("GATEWAY:", newmap);
	for (const [key, value] of newmap.entries()) {
	  console.log("VALUE:", key);
	  vector.push(key);
	}
	return vector;
  }

}