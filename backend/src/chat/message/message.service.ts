import { Injectable } from "@nestjs/common";
import { ChatRoom, Prisma, User } from "@prisma/client";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class MessageService {
    constructor(private prisma: PrismaService) {}

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
}