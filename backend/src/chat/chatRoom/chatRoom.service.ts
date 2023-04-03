import { Injectable } from "@nestjs/common";
import { AuthModuleOptions } from "@nestjs/passport";
import { User } from "@prisma/client";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class ChatRoomService {
    constructor(private prisma:PrismaService) {}


    async createChatRoom(user: User) {
      const members = [{ id: user.id }];
      const admin = [{ id: user.id }];
      
      const data = {
        ownerId: user.id,
        owner: { connect: { id: user.id } },
        members: { connect: members },
        admin: { connect: admin },
      };
    
      return await this.prisma.chatRoom.create({ data });
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
