import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { OnGatewayDisconnect, OnGatewayConnection } from '@nestjs/websockets';
import { User } from '@prisma/client';
import { io } from 'socket.io-client';
import { map } from 'rxjs';
import { Socket } from 'dgram';
import { UserService } from '../user/user.service';
import { PrismaService } from 'src/prisma/prisma.service';

@WebSocketGateway()
export class WebsocketGateway implements OnGatewayDisconnect, OnGatewayConnection {
  constructor(private userService: UserService, private prisma: PrismaService) { }
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
      if (value === client.id) {
        this.userService.updateConnectedStatus(key, 'offline');
        this.clients.delete(key);
      }
    });
  }

  @SubscribeMessage('InvitedInGame')
  async handleInvitedInGame(@ConnectedSocket() client: any, @MessageBody() data) {
    const invited = await this.prisma.user.findUnique({
      where: { username: data.invited },
    });
    const toSend = {
      invited: invited,
      invitedBy: data.invitedBy,
      url: data.url,
    }
    this.server.emit('InvitedNotif', toSend);
  }

  @SubscribeMessage('AnswerGame')
  async handleAnswerGame(@ConnectedSocket() client: any, @MessageBody() data) {
    try {
      let user;
      user = await this.prisma.user.findUnique({
        where: { username: data?.target },
      });
      if (!user) {
        user = await this.prisma.user.findUnique({
          where: { pseudo: data?.target },
        });
      }
      const toSend = {
        accepted: data.accepted,
        url: data.url,
        target: user,
      };
      this.server.emit('GameAnswer', toSend);
    }
    catch {
      return null;
    }
  }

  // ---------------------- DEPRECATED ----------------------

  async getClient() {
    const newmap = this.clients;
    const vector = [];

    for (const [key, value] of newmap.entries()) {
      const user = await this.prisma.user.findUnique({
        where: {
          pseudo: key
        },
        select: {
          id: true,
          username: true,
          connected: true,
        }
      });
      if (user)
        vector.push({
          id: user.id,
          username: user.username,
          connected: user.connected,
        });
    }
    return vector;
  }
}
