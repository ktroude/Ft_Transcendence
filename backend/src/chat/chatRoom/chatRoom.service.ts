import { Injectable } from "@nestjs/common";
import { User } from "@prisma/client";
import { PrismaService } from "src/prisma/prisma.service";


@Injectable()
export class ChatRoomService {
    constructor(private prisma:PrismaService) {}



    
    

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
