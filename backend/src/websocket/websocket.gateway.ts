import { SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { OnGatewayDisconnect, OnGatewayConnection } from '@nestjs/websockets';
import { User } from '@prisma/client';
import { io } from 'socket.io-client';
import { map } from 'rxjs';
import { Socket } from 'dgram';
import { UserService } from '../user/user.service';

@WebSocketGateway()
export class WebsocketGateway implements OnGatewayDisconnect, OnGatewayConnection {
  constructor(private userService: UserService) {}
  @WebSocketServer()
  server: Server;
  clients: Map<string, string> = new Map();

  handleConnection(client: any, ...args: any[]) { // When a client is connected, we add it to the map
    client.on('userConnected', (payload) => {
      const pseudo = payload.pseudo;
      if (this.clients.has(pseudo)) { // If user already in map, we update his socket id
        this.clients.set(pseudo, client.id);
        return;
	}
      this.clients.set(pseudo, client.id);
      this.userService.updateConnectedStatus(pseudo, 'online');
    });
  }

	handleDisconnect(client: any) // When a client is disconnected, we remove it from the map
	{
		this.clients.forEach((value, key) => {
			if (value === client.id)
      {
        this.userService.updateConnectedStatus(key, 'offline');
			  this.clients.delete(key);
      }
		});
	}
  
  // ---------------------- DEPRECATED ----------------------
  async getClient() { 
	const newmap = this.clients;
	const vector = [];
	for (const [key, value] of newmap.entries()) {
	  vector.push(key);
	}
	return vector;
  }

}