import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { User } from "@prisma/client";
import { Server, Socket } from "socket.io";
import { PrismaService } from "src/prisma/prisma.service";
import { UserService } from "src/user/user.service";
import { DirectMessageService } from "./dm.service";

@WebSocketGateway({
    cors: {
        origin: '*',
    }
})
export class DirectMessageGateway
implements OnGatewayConnection, OnGatewayDisconnect {
    constructor(
        private userService: UserService,
        private prisma: PrismaService,
        private DmService: DirectMessageService,
    ) {}

    @WebSocketServer()
    server: Server;

    private clients: [User, Socket][] = [];

async handleConnection(client:Socket) {
    const tokenCookie = client?.handshake?.headers?.authorization;
    const token = tokenCookie ? tokenCookie.split(' ')[1] : '';
    const user = await this.userService.decodeToken(token);
    if (user) {
      this.clients.push([user, client]);
    }
    else {
      this.handleDisconnect(client);
    }
}

async handleDisconnect(client: any) {
    const index = this.clients.findIndex(([, socket]) => socket === client);
    if (index !== -1) {
      this.clients.splice(index, 1);
    }
}

@SubscribeMessage('createDmRoom')
async handleCreateDmRoom(@ConnectedSocket() client: Socket, @MessageBody() data:any) {
    const user1 = this.clients.find(([user, socket]) => socket === client)?.[0];
    const user2 = await this.prisma.user.findUnique({
        where: {id: parseInt(data.targer.id, 10)}
    })
    const room = this.prisma.directMessageRoom.create({
        data: {
            ownerOneId: user1.id,
            ownerTwoId: user2.id,
        }
    });
    const toSend = {
        user1: user1,
        user2: user2,
        room: room,
    };
    this.server.emit('DmRoomCreated', toSend);
}

@SubscribeMessage('DmNotification')
async handleDmNotification(@ConnectedSocket() client: Socket, @MessageBody() data:any) {
    const user = this.clients.find(([user, socket]) => socket === client)?.[0];
    const target = this .clients.find(([search, ]) => search === user)?.[0];

    if (!target)  { // target pas sur sa page dm
        this.server.emit('DmNotif');
    }
}

@SubscribeMessage('sendDirectMessage')
async handleSendMessage(@ConnectedSocket() client: Socket , @MessageBody() data:any) {
    const user = this.clients.find(([user, socket]) => socket === client)?.[0];
	const room = await this.prisma.directMessageRoom.findUnique({
        where: {id: parseInt(data.roomId, 10)}});
	if (await this.DmService.check_blocked(room) === true) {
			this.server.emit('newDirectMessage',{
				room: data.roomId,
				message: {
					id: 0,
					content: 'You blocked this contact or have been blocked by this contact',
					senderId: 0,
					senderPseudo: 'server',
					directMessageRoomId:0,
					directMessageRoom:0,
				},
				blocked: true,
				user:user,
			});
			return ;
	}
    const newMsg = await this.DmService.createMessage(user, data.content, parseInt(data.roomId, 10));
    await this.prisma.directMessageRoom.update({
        where: {id: parseInt(data.roomId, 10)},
        data: {
            messages: {connect: {id: newMsg.id}},
        },
    });
    this.server.emit('newDirectMessage',{
        room: data.roomId,
        message: newMsg,
		blocked: false,
		user:user,
    });
}

    @SubscribeMessage('getDirectMessageRoom')
    async handleGetDirectMessageRoom(@ConnectedSocket() client:Socket) {
    const user = this.clients.find(([user, socket]) => socket === client)?.[0];
    const rooms = await this.prisma.directMessageRoom.findMany({
        where: { 
          OR: [
            { ownerOneId: user.id },
            { ownerTwoId: user.id },
          ],
        }
      });
    this.server.emit('DirectMessageRoomData', {
            rooms: rooms,
            user: user,
        });
    }

    @SubscribeMessage('getMessagesOfRoom')
    async handleGetMessagesOfRoom(@ConnectedSocket() client:Socket, @MessageBody() data:any) {
        const user = this.clients.find(([, socket]) => socket === client)?.[0];
        let room = await this.prisma.directMessageRoom.findUnique({
            where: {id: parseInt(data, 10)},
            select: { 
                messages:true,
                ownerOne:true,
                ownerTwo:true,
                id:true,
            }
        });
		let SU_id;
		if (room.ownerOne.id === user.id)
			SU_id = room.ownerTwo.id;
		else
			SU_id = room.ownerOne.id;
        const selectedUser = await this.prisma.user.findUnique({
			where: {id: SU_id}
		});
        this.server.emit('returnDirectMessage', {
            user: user,
            room: room,
            selectedUser: selectedUser,
            messages: room.messages,
        });
    }

    @SubscribeMessage('getMessagesOfConnectedUser')
    async handleGetMessagesOfConnectedUser(@ConnectedSocket() client:Socket, @MessageBody() data:any) {
        const user1 = this.clients.find(([, socket]) => socket === client)?.[0];
        const user2 = await this.userService.findUserById(parseInt(data));
        const rooms = await this.prisma.directMessageRoom.findMany({
            where: {
              OR: [
                { ownerOneId: user1.id, ownerTwoId: user2.id },
                { ownerOneId: user2.id, ownerTwoId: user1.id },
              ],
            },
            select: {
                messages:true,
                ownerOne:true,
                ownerTwo:true,
                id:true,
            }
          });
        if (rooms.length > 0) {
            this.server.emit('returnDirectMessage', {
                user: user1,
                room: rooms[0],
                selectedUser: user2,
                messages: rooms[0].messages,
            });
        }
        else {
            const room = await this.prisma.directMessageRoom.create({
                data: {
                    ownerOneId: user1.id,
                    ownerTwoId: user2.id,
                }
            })
            this.server.emit('returnDirectMessage', {
                user: user1,
                room: room,
                selectedUser: user2,
                messages: [],
            });
        }
    }






}