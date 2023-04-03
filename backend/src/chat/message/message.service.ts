import { Injectable } from "@nestjs/common";
import { ChatRoom, User } from "@prisma/client";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class MessageService {
    constructor(private prisma:PrismaService) {}

    async createMessage(text: string, user: User, from: ChatRoom) {
        const data = {
            content: text,
            senderId: user.id,
            senderPseudo: user.pseudo,
            chatRoomId: from.id
        }
    }

    
}