import {
  ConnectedSocket,
  MessageBody,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { ChatRoom, User } from '@prisma/client';
import { subscribeOn } from 'rxjs';
import { Server, Socket } from 'socket.io';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserService } from 'src/user/user.service';
import { runInThisContext } from 'vm';
import { ChatRoomService } from './chatRoom.service';
import { log } from 'console';
import { emit } from 'process';

@WebSocketGateway({
  cors: {
    // origin a changer plus tard, rajouter un /path, voir avec le front plus tard
    origin: '*',
    methods: ['GET', 'POST'],
  },
})
export class ChatRoomGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    private userService: UserService,
    private prismaService: PrismaService,
    private chatRoomService: ChatRoomService,
  ) { }

  @WebSocketServer()
  server: Server;

  // nos tableaux de chatrooms et de client (avec le User associé)
  private chatRooms: ChatRoom[] = [];
  private clients: [User, Socket][] = [];

  afterInit(server: any) {
    console.log('Init done');
  }

  async handleConnection(client: Socket) {
    const tokenCookie = client?.handshake?.headers?.authorization;
    const token = tokenCookie ? tokenCookie.split(' ')[1] : '';
    const user = await this.userService.decodeToken(token);
    // associer le user et sa socket-client associe
    if (user) {
      this.clients.push([user, client]);
    }
    else {
      this.handleDisconnect(client);
    }
  }

  handleDisconnect(client: Socket) {
    const index = this.clients.findIndex(([, socket]) => socket === client);
    if (index !== -1) {
      this.clients.splice(index, 1);
    }
  }

  @SubscribeMessage('createRoom')
  async handleCreateRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: any,
  ) {

    const user = this.clients.find(([user, socket]) => socket === client)?.[0];
    let newChatRoom = await this.prismaService.chatRoom.create({
      data: {
        name: data.name,
        password: data.password,
        private: data.private,
        ownerId: user.id,
      },
    });
    newChatRoom = await this.prismaService.chatRoom.update({
      where: { id: newChatRoom.id },
      data: {
        members: { connect: { id: user.id } },
        admin: { connect: { id: user.id } },
      },
    });
    this.server.emit('roomCreated', newChatRoom);
  }

  @SubscribeMessage('getMessage')
  async handleGetMessage(@ConnectedSocket() client: Socket, @MessageBody() data: any) {
    const user = this.clients.find(([, socket]) => socket === client)?.[0];
    const chatRoom = await this.prismaService.chatRoom.findUnique({
      where: { id: data.id},
      select: {messages: true},
    });
    const messages = chatRoom.messages;
    this.server.emit('returnMessage', messages)
  }


  @SubscribeMessage('sendMessage')
  async handleSendMessage(@ConnectedSocket() client, @MessageBody() data: any) {
    const user = this.clients.find(([, socket]) => socket === client)?.[0];
    const chatRoom = await this.prismaService.chatRoom.findUnique({
      where: {id: data.roomId}});
    if ((await this.chatRoomService.isMuted(user, chatRoom)) === true) {
      // handle error
    }
    else {
      const newMessage = await this.chatRoomService.createMessage(data.content, user, chatRoom);
      console.log("n message =====", newMessage);
      this.server.emit('newMessage', newMessage);
    }
  }

  @SubscribeMessage('getUser')
  async handleGetUser(@ConnectedSocket() client:Socket, @MessageBody() data: any) {
    const user = this.clients.find(([, socket]) => socket === client)?.[0];
    console.log('data =', data);
    const chatRoom = await this.prismaService.chatRoom.findUnique({
      where: {id: data.id}});
    let toSend = {
      pseudo: user.pseudo,
      status: 2,
      room: chatRoom.id,
    };
    if (await this.chatRoomService.isOwner(user, chatRoom) === true) {
      toSend.status = 2;
    }
    else if (await this.chatRoomService.isAdmin(user, chatRoom) === true) {
      toSend.status = 1;
    }
    else if (await this.chatRoomService.isMuted(user, chatRoom) === true) {
      toSend.status = -1
    }
    else if (await this.chatRoomService.isBanned(user, chatRoom) === true) {
      toSend.status = -2
    }
    else if (await this.chatRoomService.isMember(user, chatRoom) === true) {
      toSend.status = 0;
    }
    this.server.emit('returnUser', toSend);
  }

  @SubscribeMessage('checkUser')
  async handleCheckUser(@ConnectedSocket() client:Socket, @MessageBody() data: any) {
    const user = await this.prismaService.user.findUnique({
      where: {id: data.id},
    })
    console.log('data =', data);
    const chatRoom = await this.prismaService.chatRoom.findUnique({
      where: {id: data.id}});
    let toSend = {
      pseudo: user.pseudo,
      status: -2,
      room: chatRoom.id,
    };
    if (await this.chatRoomService.isOwner(user, chatRoom) === true) {
      toSend.status = 2;
    }
    else if (await this.chatRoomService.isAdmin(user, chatRoom) === true) {
      toSend.status = 1;
    }
    else if (await this.chatRoomService.isMuted(user, chatRoom) === true) {
      toSend.status = -1
    }
    else if (await this.chatRoomService.isBanned(user, chatRoom) === true) {
      toSend.status = -2
    }
    else if (await this.chatRoomService.isMember(user, chatRoom) === true) {
      toSend.status = 0;
    }
    console.log('RETURN USER CHEKED ===', toSend);
    this.server.emit('returnCheckUser', toSend);
  }

  // @SubscribeMessage('newAdmin')
  // async handleNewAdmin(
  //   @ConnectedSocket() client: Socket,
  //   @MessageBody() data: any,
  // ) {
  //   const user = this.clients.find(([, socket]) => socket === client)?.[0];
  //   const newAdmin = await this.userService.findUserByPseudo(
  //     data.newAdminPseudo,
  //   );
  //   const chatRoom = await this.prismaService.chatRoom.findUnique(
  //     data.chatRoomId,
  //   );
  //   if (
  //     ((await this.chatRoomService.isAdmin(user, chatRoom)) ===
  //       (await this.chatRoomService.isOwner(user, chatRoom))) ===
  //     false
  //   ) {
  //     //handle error
  //   }
  //   if (
  //     (await this.chatRoomService.isAdmin(user, chatRoom)) === true ||
  //     (await this.chatRoomService.isOwner(user, chatRoom)) === true
  //   ) {
  //     //handle error
  //   }
  //   await this.prismaService.chatRoom.update({
  //     where: { id: chatRoom.id },
  //     data: {
  //       admin: { connect: { id: newAdmin.id } },
  //     },
  //   });
  // }

  // @SubscribeMessage('unAdminded')
  // async handleUnAdminded(
  //   @ConnectedSocket() client: Socket,
  //   @MessageBody() data: any,
  // ) {
  //   const user = this.clients.find(([, socket]) => socket === client)?.[0];
  //   const chatRoom = await this.prismaService.chatRoom.findUnique(
  //     data.chatRoomId,
  //   );
  //   if ((await this.chatRoomService.isOwner(user, chatRoom)) === false) {
  //     // handle error
  //     // checker si le user est bien un owner pour pouvoir unadmined un admin
  //   }
  //   const userToUnadmin = await this.userService.findUserByPseudo(
  //     data.userToUnadmined,
  //   );
  //   if (
  //     (await this.chatRoomService.isAdmin(userToUnadmin, chatRoom)) === false ||
  //     (await this.chatRoomService.isOwner(userToUnadmin, chatRoom)) === true
  //   ) {
  //     // checker si le adminToUnadmin est bien un admin et n'est pas le owner
  //     // handle error
  //   }
  //   await this.prismaService.chatRoom.update({
  //     where: { id: chatRoom.id },
  //     data: { admin: { disconnect: { id: userToUnadmin.id } } },
  //   });
  //   // envoyer un ptit message pour dire que admin n'est plus admin
  // }

  // @SubscribeMessage('newMute')
  // async handleNewMuted(
  //   @ConnectedSocket() client: Socket,
  //   @MessageBody() data: any,
  // ) {
  //   const user = this.clients.find(([, socket]) => socket === client)?.[0];
  //   const chatRoom = await this.prismaService.chatRoom.findUnique(
  //     data.chatRoomId,
  //   );
  //   const userToMute = await this.userService.findUserByPseudo(data.userToMute);
  //   if (
  //     ((await this.chatRoomService.isAdmin(user, chatRoom)) ===
  //       (await this.chatRoomService.isOwner(user, chatRoom))) ===
  //     false
  //   ) {
  //     // checker si le user est un admin ou le owner
  //     //handle error
  //   }
  //   if ((await this.chatRoomService.isMuted(userToMute, chatRoom)) === true) {
  //     // checker si le userToMute n'est pas deja mute
  //     // hanle error
  //   }
  //   await this.prismaService.chatRoom.update({
  //     where: { id: chatRoom.id },
  //     data: { muted: { connect: { id: userToMute.id } } },
  //   });
  //   // envoyer un ptit message pour dire aue userToMute a ete Mute
  // }

  // @SubscribeMessage('unMuted')
  // async handleUnMuted(
  //   @ConnectedSocket() client: Socket,
  //   @MessageBody() data: any,
  // ) {
  //   const user = this.clients.find(([, socket]) => socket === client)?.[0];
  //   const chatRoom = await this.prismaService.chatRoom.findUnique(
  //     data.chatRoomId,
  //   );
  //   const userToUnmute = await this.userService.findUserByPseudo(
  //     data.userToUnmute,
  //   );
  //   if (
  //     ((await this.chatRoomService.isAdmin(user, chatRoom)) ===
  //       (await this.chatRoomService.isOwner(user, chatRoom))) ===
  //     false
  //   ) {
  //     // checker si le user est un admin ou le owner
  //     //handle error
  //   }
  //   if ((await this.chatRoomService.isMuted(userToUnmute, chatRoom)) === true) {
  //     // checker si userToUnmute est bien dans la room et est bien mute
  //     // handle error
  //   }
  //   await this.prismaService.chatRoom.update({
  //     where: { id: chatRoom.id },
  //     data: { muted: { disconnect: { id: userToUnmute.id } } },
  //   });
  // }

  @SubscribeMessage('newBan')
  async handleNewBan(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: any,
  ) {
    const user = this.clients.find(([, socket]) => socket === client)?.[0];
    const chatRoom = await this.prismaService.chatRoom.findUnique(
      data.room.id,
    );
    const userToBan = await this.userService.findUserByPseudo(data.toBan);
    if (
      ((await this.chatRoomService.isAdmin(user, chatRoom)) ===
        (await this.chatRoomService.isOwner(user, chatRoom))) ===
      false
    ) {
        return ;
    }
    if (
      (await this.chatRoomService.isAdmin(userToBan, chatRoom)) === true &&
      (await this.chatRoomService.isAdmin(user, chatRoom)) === true &&
      (await this.chatRoomService.isOwner(user, chatRoom)) === false
    ) {
        return ;
    }
    if ((await this.chatRoomService.isBanned(userToBan, chatRoom)) === true) {
      return ;
    }
    await this.prismaService.chatRoom.update({
      where: { id: chatRoom.id },
      data: { banned: { connect: { id: userToBan.id } } },
    });
    const datatoSend = {
      sender:'',
      content:'${userToBan.pseudo} a été banni'
    }
    this.server.emit('newMessage', datatoSend);
    this.server.emit('newBan', userToBan.id);
  }

  // @SubscribeMessage('unBan')
  // async handleUnBan(
  //   @ConnectedSocket() client: Socket,
  //   @MessageBody() data: any,
  // ) {
  //   const user = this.clients.find(([, socket]) => socket === client)?.[0];
  //   const chatRoom = await this.prismaService.chatRoom.findUnique(
  //     data.chatRoomId,
  //   );
  //   const userToUnban = await this.userService.findUserByPseudo(
  //     data.userToUnban,
  //   );
  //   if (
  //     ((await this.chatRoomService.isAdmin(user, chatRoom)) ===
  //       (await this.chatRoomService.isOwner(user, chatRoom))) ===
  //     false
  //   ) {
  //     // checker si le user est un admin ou le owner
  //     //handle error
  //   }
  //   if (
  //     (await this.chatRoomService.isBanned(userToUnban, chatRoom)) === false
  //   ) {
  //     // checker si userToUnban est bien deja ban
  //     // handle error
  //   }
  //   await this.prismaService.chatRoom.update({
  //     where: { id: chatRoom.id },
  //     data: { banned: { disconnect: { id: userToUnban.id } } },
  //   });
  // }

  @SubscribeMessage('leaveRoom')
  async handleLeaveRoom(client: Socket, data: any) {
    console.log('je suis ici');
    const user = this.clients.find(([, socket]) => socket === client)?.[0];
    const toCheck = await this.prismaService.chatRoom.findUnique({
      where: {id: data.id},
      select: {owner:true, id: true, name:true, messages:true},
    })
    if (toCheck.owner.id === user.id) {
      console.log('je delete ici');
      await this.prismaService.message.deleteMany({
        where: {chatRoomId: data.id},
      })
      await this.prismaService.chatRoom.update({
        where: {id: data.id},
        data: { 
          members: {disconnect:{id:user.id}},
          admin: {disconnect:{id:user.id}},
        },
      })
      console.log('delete room num', data.id);
      await this.prismaService.chatRoom.delete({
        where: { id: data.id },
      });
      console.log('fin du delete........')
      this.server.emit('deleteRoom', data.id);
      return ;
    }
    else {
      await this.prismaService.chatRoom.update({
        where: {id: data.id},
        data: { members: {connect: {id: user.id}}},
      });
      const toSend = await this.chatRoomService.createMessage(`${user.pseudo} a quitté la room`,
      {id: 0, pseudo:'server'}, {id: data.id});
      this.server.emit('newMessage', toSend);
    }
  }

  @SubscribeMessage('joinRoom')
  async handleJoinRoom(client:Socket, data:any) {
    const user = this.clients.find(([, socket]) => socket === client)?.[0];
    const toCheck = await this.prismaService.chatRoom.findUnique({
      where: {id: data.id},
      select: {members:true},
    })
    const isMember = toCheck.members.some(member => member.id === user.id);
    console.log('isM ==', isMember);
    await this.prismaService.chatRoom.update({
      where: {id: data.id},
      data: { members: {connect: {id: user.id}}},
    });
    if (!isMember) {
      const toSend = await this.chatRoomService.createMessage(`${user.pseudo} a rejoind la room`,
      {id: 0, pseudo:'server'}, {id: data.id});
      this.server.emit('newMessage', toSend);
    }
  }



}
