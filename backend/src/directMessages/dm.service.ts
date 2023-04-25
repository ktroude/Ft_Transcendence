import { Injectable } from "@nestjs/common";
import { User } from "@prisma/client";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class DirectMessageService {
    constructor(private prisma: PrismaService) {}
 
    async createMessage(user:User, content:string, roomId:number) {
    return await this.prisma.directMessage.create({
        data: {
            content: content,
            senderId: user.id,
            senderPseudo: user.pseudo,
            directMessageRoomId: roomId
        }
        });
    }
}