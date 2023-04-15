import { Injectable } from '@nestjs/common';
import { ChatRoom, User } from '@prisma/client';
import { Prisma } from '@prisma/client';
import { all } from 'axios';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ChatRoomService {
  constructor(private prisma: PrismaService) {}

  async isAdmin(user: User, chatRoom: ChatRoom): Promise<Boolean> {
    const isAdmin = await this.prisma.chatRoom
      .findUnique({ where: { id: chatRoom.id } })
      .admin({ where: { id: user.id } })
      .then((user) => !!user);
    return isAdmin;
  }

  async isOwner(user: User, chatRoom: ChatRoom): Promise<boolean> {
    const isOwner = await this.prisma.chatRoom.findUnique({
      where: { id: chatRoom.id },
      select: { owner: { select: { id: true } } },
    });
      if (isOwner)
        return true;
      else
      return false;
  }

  async isMuted(user: User, chatRoom: ChatRoom): Promise<boolean> {
    const isMuted = await this.prisma.chatRoom
      .findUnique({ where: { id: chatRoom.id } })
      .muted({ where: { id: user.id } })
      if (isMuted.length)
        return true;
      else
      return false;
  }

  async isBanned(user: User, chatRoom: ChatRoom): Promise<boolean> {
    const isBanned = await this.prisma.chatRoom
      .findUnique({ where: { id: chatRoom.id } })
      .banned({ where: { id: user.id } })
      if (isBanned.length)
        return true;
      else
      return false;
  }

  async isMember(user: User, chatRoom: ChatRoom): Promise<boolean> {
    const isMember = await this.prisma.chatRoom
      .findUnique({ where: { id: chatRoom.id } })
      .members({ where: { id: user.id } })
      if (isMember.length)
        return true;
      else
      return false;
  }

  async getAllChatRoom() {
    const rooms = await this.prisma.chatRoom.findMany({ });
    return rooms;
  }

  // async createChatRoom(user: User) {
  //   const chatRoomData: Prisma.ChatRoomCreateInput = {
  //     owner: { connect: { id: user.id } },
  //     members: { connect: [{ id: user.id }] },
  //     admin: { connect: [{ id: user.id }] },
  //     muted: { connect: [] },
  //     banned: { connect: [] },
  //     messages: { connect: [] },
  //   };
  // 
  //   return await this.prisma.chatRoom.create({
  //     data: chatRoomData,
  //   });
  // }

  async createMessage(text: string, user:any, chatRoom:any) {
    const messageData: Prisma.MessageCreateInput = {
      content: text,
      senderId: user.id,
      senderPseudo: user.pseudo,
      chatRoom: { connect: { id: chatRoom.id } },
    };

    const createdMessage = await this.prisma.message.create({
      data: messageData,
    });

    await this.prisma.chatRoom.update({
      where: { id: chatRoom.id },
      data: { messages: { connect: { id: createdMessage.id } } },
    });
    return createdMessage;
  }

  async getUniqueChatRoom(idChatRoom: number) {
    return this.prisma.chatRoom.findUnique({
      where: {
        id: idChatRoom,
      },
    });
  }



}
