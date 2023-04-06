import { Controller, Post } from "@nestjs/common";
import { ChatRoomService } from "./chatRoom.service";
import { PrismaService } from "src/prisma/prisma.service";

@Controller({})
export class ChatRoomController {
    constructor(private prisma:PrismaService ,private chatRoomService: ChatRoomService) {}

    @Post('newChatRoom')
    async createChatRoom(userId: number) {
        const user = await this.prisma.user.findUnique({
            where: {
                id: userId,
            }
        });

        return this.chatRoomService.createChatRoom(user);
    }
}