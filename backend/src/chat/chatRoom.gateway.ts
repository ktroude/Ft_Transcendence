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
import { Server, Socket } from 'socket.io';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserService } from 'src/user/user.service';
import { ChatRoomService } from './chatRoom.service';
import * as bcrypt from 'bcryptjs'
import { RouterModule } from '@nestjs/core';


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
  private muted = new Map();

  afterInit(server: any) {
    ('Init done');
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
    const password = data.password.length ? bcrypt.hashSync(data.password) : '';
    let newChatRoom = await this.prismaService.chatRoom.create({
      data: {
        name: data.name,
        password: password,
        private: data.private,
        ownerId: user.id,
      },
    });
    await this.prismaService.chatRoom.update({
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
      where: { id: data.id },
      select: { 
        messages: true,
        id:true,
        createdAt: true,
        updatedAt:true,
        name:true,
        password:true,
        private:true,
        ownerId:true,
       },
    });
    const messages = chatRoom.messages;
    if (await this.chatRoomService.isBanned(user, chatRoom) === true) {
      const toSend = {
        to: user.id,
        banned: true
      }
      return toSend;
    }
    const toSend = {
      banned: false,
      msg: messages,
      to: user.id,
    }
    this.server.emit('returnMessage', toSend);
  }


  @SubscribeMessage('sendMessage')
  async handleSendMessage(@ConnectedSocket() client, @MessageBody() data: any) {
    try {
      const user = this.clients.find(([, socket]) => socket === client)?.[0];
      const chatRoom = await this.prismaService.chatRoom.findUnique({
        where: { id: data.roomId }
    });
    if ((await this.chatRoomService.isMuted(user, chatRoom)) === true) {
      return;
    }
    else if ((await this.chatRoomService.isBanned(user, chatRoom)) === true) {
      return ;
    }
    else {
      const newMessage = await this.chatRoomService.createMessage(data.content, user, chatRoom);
      this.server.emit('newMessage', newMessage);
    }
  }
  catch {

  }
  }

  @SubscribeMessage('getUser')
  async handleGetUser(@ConnectedSocket() client: Socket, @MessageBody() data: any) {
    const user = this.clients.find(([, socket]) => socket === client)?.[0];
    const chatRoom = await this.prismaService.chatRoom.findUnique({
      where: { id: data.id }
    });
    let toSend = {
      to: user.id,
      user: {
        id: user.id,
        pseudo: user.pseudo,
        status: 2,
        room: chatRoom.id,
      },
    };
    if (await this.chatRoomService.isOwner(user, chatRoom) === true) {
      toSend.user.status = 2;
    }
    else if (await this.chatRoomService.isAdmin(user, chatRoom) === true) {
      toSend.user.status = 1;
    }
    else if (await this.chatRoomService.isMuted(user, chatRoom) === true) {
      toSend.user.status = -1
    }
    else if (await this.chatRoomService.isBanned(user, chatRoom) === true) {
      toSend.user.status = -2
    }
    else if (await this.chatRoomService.isMember(user, chatRoom) === true) {
      toSend.user.status = 0;
    }
    this.server.emit('returnUser', toSend);
  }

  @SubscribeMessage('checkUser')
  async handleCheckUser(@ConnectedSocket() client: Socket, @MessageBody() data: any) {
    const user = await this.prismaService.user.findUnique({
      where: { pseudo: data.pseudo },
    })
    const chatRoom = await this.prismaService.chatRoom.findUnique({
      where: { id: data.id }
    });
    let toSend = {
      id: user.id,
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
    this.server.emit('returnCheckUser', toSend);
  }

  @SubscribeMessage('newAdmin')
  async handleNewAdmin(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: any,
  ) {
    const user = this.clients.find(([, socket]) => socket === client)?.[0];
    const chatRoom = await this.prismaService.chatRoom.findUnique({
      where: { id: data.room.id },
    });
    const userToUp = await this.prismaService.user.findUnique({
      where: { id: data.user.id }
    });
    await this.prismaService.chatRoom.update({
      where: { id: chatRoom.id },
      data: {
        admin: { connect: { id: userToUp.id } },
      },
    });
    this.server.emit('adminAdded', { user: userToUp, room: chatRoom });
  }

  @SubscribeMessage('unAdminded')
  async handleUnAdminded(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: any,
  ) {
    const user = this.clients.find(([, socket]) => socket === client)?.[0];
    const chatRoom = await this.prismaService.chatRoom.findUnique({
      where: { id: data.room.id },
    });
    const userToUnadmin = await this.prismaService.user.findUnique({
      where: { id: data.user.id }
    });
    await this.prismaService.chatRoom.update({
      where: { id: chatRoom.id },
      data: { admin: { disconnect: { id: userToUnadmin.id } } },
    });
    this.server.emit('adminRemoved', { user: userToUnadmin, room: chatRoom });
  }

  @SubscribeMessage('newMute')
  async handleNewMuted(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: any,
  ) {
    const user = this.clients.find(([, socket]) => socket === client)?.[0];
    const chatRoom = await this.prismaService.chatRoom.findUnique({
      where: { id: data.room.id },
    });
    const userToMute = await this.prismaService.user.findUnique({
      where: { id: data.user.id }
    });
    await this.prismaService.chatRoom.update({
      where: { id: chatRoom.id },
      data: { muted: { connect: { id: userToMute.id } } },
    });
    this.server.emit('muted', { user: userToMute, room: chatRoom });
    await this.startMuteTimer(userToMute, chatRoom);
  }

  async startMuteTimer(user: User, room: ChatRoom) {
    let TimeInMs = 12000; // 2min
    const timer = setInterval(async () => {
      TimeInMs -= 1000;
      this.muted.set(user.id, TimeInMs);
      const TimeInSec = Math.ceil(TimeInMs / 1000);
      const seconds = TimeInSec % 60;
      this.muted.set(user.id, seconds);
      if (TimeInMs <= 0) {
        try {
          await this.prismaService.chatRoom.update({
            where: { id: room.id },
            data: {
              muted: { disconnect: { id: user.id } }
            }
          });
          this.server.emit('unMuted', { user: user, room: room });
          this.muted.delete(user.id);
          clearInterval(timer);
        }
        catch {}
        }
      }, 1000); // chaque sec
  }

  @SubscribeMessage('checkMute')
  async handleCheckMute(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: any,
  ) {
    const user = this.clients.find(([, socket]) => socket === client)?.[0];
    const chatRoom = await this.prismaService.chatRoom.findUnique({
      where: { id: data.room.id },
    });
    if (await this.chatRoomService.isMuted(user, chatRoom) === true) {
      const data = {
        message: { senderPseudo: 'server', content: `Vous etes encore mute pour ${this.muted.get(user.id).toString()} secondes` },
        user: user,
        room: chatRoom,
      }
      this.server.emit('stayMute', data);
    }
  }

  @SubscribeMessage('unMuted')
  async handleunMuted(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: any,
  ) {
    try{

      const user = this.clients.find(([, socket]) => socket === client)?.[0];
      const chatRoom = await this.prismaService.chatRoom.findUnique({
        where: { id: data.room.id },
      });
      const userToMute = await this.prismaService.user.findUnique({
      where: { id: data.user.id }
    });
    await this.prismaService.chatRoom.update({
      where: { id: chatRoom.id },
      data: { muted: { disconnect: { id: userToMute.id } } },
    });
    this.server.emit('unMuted', { user: userToMute, room: chatRoom });
  }
  catch  {

  }
  }

  @SubscribeMessage('newBan')
  async handleNewBan(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: any,
  ) {
    const user = this.clients.find(([, socket]) => socket === client)?.[0];
    const chatRoom = await this.prismaService.chatRoom.findUnique({
      where: { id: data.room.id },
    });
    const userToBan = await this.prismaService.user.findUnique({
      where: { id: data.user.id }
    });
    await this.prismaService.chatRoom.update({
      where: { id: chatRoom.id },
      data: {
        banned: { connect: { id: userToBan.id } },
        members: { disconnect: {id: userToBan.id}},
       },
    });
    const newMsg = {
      sender: 'server',
      content: `${userToBan.pseudo} a été banni de la room`
    }
    const toSend = {
      user: userToBan,
      room: chatRoom
    }
    this.server.emit('newMessage', newMsg);
    this.server.emit('banned', toSend);
  }

  @SubscribeMessage('unBan')
  async handleUnBan(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: any,
  ) {
    const user = this.clients.find(([, socket]) => socket === client)?.[0];
    const chatRoom = await this.prismaService.chatRoom.findUnique({
      where: { id: data.room.id },
    });
    const userToUnban = await this.prismaService.user.findUnique({
      where: { id: data.user.id }
    });
    await this.prismaService.chatRoom.update({
      where: { id: chatRoom.id },
      data: { banned: { disconnect: { id: userToUnban.id } } },
    });
    const toSend = {
      user: userToUnban,
      room: chatRoom,
    }
    this.server.emit('newDeban', toSend);
  }

  @SubscribeMessage('kick')
  async handleKick(client: Socket, data: any) {
    const user = this.clients.find(([, socket]) => socket === client)?.[0];
    const toKick = await this.prismaService.user.findUnique({
      where: { id: data.id },
    });
    const roomToFree = await this.prismaService.chatRoom.findUnique({
      where: { id: data.room },
    });
    if (toKick && roomToFree) {
      await this.prismaService.chatRoom.update({
        where: { id: roomToFree.id },
        data: {
          members: { disconnect: { id: toKick.id } },
        }
      });
      this.server.emit('kicked', { user: toKick, room: roomToFree });
    }
  }

  @SubscribeMessage('leaveRoom')
  async handleLeaveRoom(client: Socket, data: any) {
    const user = this.clients.find(([, socket]) => socket === client)?.[0];
    const toCheck = await this.prismaService.chatRoom.findUnique({
      where: { id: data.id },
      select: { owner: true, id: true, name: true, messages: true },
    })
    if (toCheck.owner.id === user.id) {
      await this.prismaService.message.deleteMany({
        where: { chatRoomId: data.id },
      })
      // await this.prismaService.chatRoom.update({
      //   where: { id: data.id },
      //   data: {
      //     members: { disconnect: { id: user.id } },
      //     admin: { disconnect: { id: user.id } },
      //   },
      // })
      await this.prismaService.chatRoom.delete({
        where: { id: data.id },
      });
      this.server.emit('deleteRoom', data.id);
      return;
    }
    else {
      await this.prismaService.chatRoom.update({
        where: { id: data.id },
        data: { members: { disconnect: { id: user.id } } },
      });
      const toSend = await this.chatRoomService.createMessage(`${user.pseudo} a quitté la room`,
        { id: 0, pseudo: 'server' }, { id: data.id });
      this.server.emit('newMessage', toSend);
      this.server.emit('roomLeaved', toCheck.id);
    }
  }

  @SubscribeMessage('joinRoom')
  async handleJoinRoom(client: Socket, data: any) {
    const user = this.clients.find(([, socket]) => socket === client)?.[0];
    const toCheck = await this.prismaService.chatRoom.findUnique({
      where: { id: data.room.id },
      select: {
        members: true,
        password: true,
        id:true,
        banned:true,
        muted:true,
      },
    });
    const sucessData = await this.prismaService.chatRoom.findUnique({
      where : {id: toCheck.id},
    });
    if (await this.chatRoomService.isBanned(user, sucessData) === true) {
      const msg = {senderPseudo:'server', content:'Vous etes ban de cette room'}
      this.server.emit('failed',{
        user:user,
        message:msg,
		animation:{
			content: 'ban',
			id: toCheck.id
		  },
      });
      return;
    }
    if (toCheck.password.length) {
      const pwCheck = bcrypt.compareSync(data.password, toCheck.password);
      if (pwCheck === false) {
        //this.server.emit('wrongPW', { room: toCheck, user: user });
        const msg = {senderPseudo:'server', content:'Mauvais mot de passe'}
        this.server.emit('failed',{
          user:user,
          message:msg,
		  animation: {
			content: 'wrong',
			id: toCheck.id
		  }
        });
        return;
      }
    }
    const isMember = toCheck.members.some(member => member.id === user.id);
    await this.prismaService.chatRoom.update({
      where: { id: data.room.id },
      data: { members: { connect: { id: user.id } } },
    });
    if (!isMember) {
      const toSend = await this.chatRoomService.createMessage(`${user.pseudo} a rejoint la room`,
        { id: 0, pseudo: 'server' }, { id: data.room.id });
      this.server.emit('newMessage', toSend);
    }
    const dataRoomToSend = {
      name: sucessData.name,
      private: sucessData.private,
      id: sucessData.id,
      password: sucessData.password.length? true : false,

    }
    this.server.emit('sucess', {
      room: dataRoomToSend,
      banned: toCheck.banned,
      membres: toCheck.members,
      muted: toCheck.muted,
      user:user,
	  animation: {
		content: 'ok',
		id: toCheck.id
	  }
    } );
  }

  @SubscribeMessage('addUser')
  async handleAddUser(client: Socket, data: any) {
    const user = this.clients.find(([, socket]) => socket === client)?.[0];
    const chatRoom = await this.prismaService.chatRoom.findUnique({
      where: { id: data.room.id }
    })
    const userToAdd = await this.prismaService.user.findUnique({
      where: { pseudo: data.pseudo },
    });
    if (!userToAdd) {
      this.server.emit('UserAdded', { sucess: false, userToAdd: null, user: user })
      return;
    }
    else {
      if (await this.chatRoomService.isMember(userToAdd, chatRoom) === true) {
        this.server.emit('UserAdded', { sucess: false, userToAdd: userToAdd, user: user });
        return;
      }
      await this.prismaService.chatRoom.update({
        where: { id: data.room.id },
        data: {
          members: { connect: { id: userToAdd.id } }
        }
      });
        const toSend = await this.chatRoomService.createMessage(`${userToAdd.pseudo} a rejoind la room`,
          { id: 0, pseudo: 'server' }, chatRoom);
          this.server.emit('UserAdded', { sucess: true, user: userToAdd });
          this.server.emit('sucess');
          this.server.emit('newMessage', toSend);
    }
  }

  @SubscribeMessage('changePassword')
  async handleChangePassword(client:Socket, data:any) {
    const user = this.clients.find(([, socket]) => socket === client)?.[0];
    const room = await this.prismaService.chatRoom.findUnique({
      where: {id: parseInt(data.room.id, 10)}
    });
    if (await this.chatRoomService.isOwner(user, room) === false)
      return ;
    console.log('ancien mdp ==', room.password);
    await this.prismaService.chatRoom.update({
      where: {id: room.id},
      data: {
        password: bcrypt.hashSync(data.newPassword),
      }
    });
    const wroom = await this.prismaService.chatRoom.findUnique({
      where: {id: parseInt(data.room.id, 10)}
    });
    console.log('new mdp ==', wroom.password);
    this.server.emit('passwordChanged');
  }

  @SubscribeMessage('deletePassword')
  async handleDeletePassword(client:Socket, data:any) {
    const user = this.clients.find(([, socket]) => socket === client)?.[0];
    const room = await this.prismaService.chatRoom.findUnique({
      where: {id: parseInt(data.room.id, 10)}
    });
    if (await this.chatRoomService.isOwner(user, room) === false) {
      return ;
    }
    console.log('ancien mdp ==', room.password);
    await this.prismaService.chatRoom.update({
      where: {id: room.id},
      data: {
        password: '',
      }
    });
    const wroom = await this.prismaService.chatRoom.findUnique({
      where: {id: parseInt(data.room.id, 10)}
    });
    console.log('new mdp ==', wroom.password);
    this.server.emit('passwordChanged');
  }

}
