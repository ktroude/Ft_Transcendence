import { Injectable } from "@nestjs/common";
import { ChatRoom, User } from "@prisma/client";
import { Prisma } from '@prisma/client';
import { PrismaService } from "src/prisma/prisma.service";


@Injectable()
export class ChatRoomService {
    constructor(private prisma:PrismaService) {}


    async createChatRoom(user:User) {
      const chatRoomData: Prisma.ChatRoomCreateInput = {
        owner: { connect: { id: user.id } },
        members: { connect: [{ id: user.id }] },
        admin: { connect: [{ id: user.id }] },
        muted: { connect: [] },
        banned: { connect: [] },
        messages: { connect: [] },
      };
    
      return await this.prisma.chatRoom.create({
        data: chatRoomData,
      });
    }
    
    async createMessage(text: string, user: User, chatRoom: ChatRoom) {
      const messageData: Prisma.MessageCreateInput = {
          content: text,
          senderId: user.id,
          senderPseudo: user.pseudo,
          chatRoom: { connect: { id: chatRoom.id } }
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

    async getAllChatRoom() {
      return this.prisma.chatRoom.findMany()
    }

    async getUniqueChatRoom(idChatRoom: number) {
      return this.prisma.chatRoom.findUnique({
        where: {
          id: idChatRoom
        }
      })
    }


}  
