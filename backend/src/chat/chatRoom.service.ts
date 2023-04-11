import { Injectable } from '@nestjs/common';
import { ChatRoom, User } from '@prisma/client';
import { Prisma } from '@prisma/client';
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
    if (!isOwner) return false; // supprimer la room en plus ici
    return isOwner.owner.id === user.id;
  }

  async isMuted(user: User, chatRoom: ChatRoom): Promise<boolean> {
    const isMuted = await this.prisma.chatRoom
      .findUnique({ where: { id: chatRoom.id } })
      .muted({ where: { id: user.id } })
      .then((user) => !!user);
    return isMuted;
  }

  async isBanned(user: User, chatRoom: ChatRoom): Promise<boolean> {
    const isBanned = await this.prisma.chatRoom
      .findUnique({ where: { id: chatRoom.id } })
      .banned({ where: { id: user.id } })
      .then((user) => !!user);
    return isBanned;
  }

  async isMember(user: User, chatRoom: ChatRoom): Promise<boolean> {
    const isMember = await this.prisma.chatRoom
      .findUnique({ where: { id: chatRoom.id } })
      .members({ where: { id: user.id } })
      .then((user) => !!user);
    return isMember;
  }

  async getAllChatRoom() {
    const rooms = await this.prisma.chatRoom.findMany({
      select: {
        id: true,
        name: true,
        owner: true,
      },
    });
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

  async createMessage(text: string, user: User, chatRoom: ChatRoom) {
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
