import { Injectable } from "@nestjs/common";
import { Message, User } from "@prisma/client";
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
