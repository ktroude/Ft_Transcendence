import { Controller, Get, Post } from "@nestjs/common";
import { ChatRoomService } from "./chatRoom.service";
import { PrismaService } from "src/prisma/prisma.service";

@Controller('chat')
export class ChatRoomController {
    constructor(private prisma:PrismaService ,private chatRoomService: ChatRoomService) {}

    // @Post('newChatRoom')
    // async createChatRoom(userId: number) {
    //     const user = await this.prisma.user.findUnique({
    //         where: {
    //             id: userId,
    //         }
    //     });

    //     return this.chatRoomService.createChatRoom(user);
    // }

    @Get('getAll')
    async getAllChatRoom() {
        console.log("getAllChatRoom");
        
        return await this.chatRoomService.getAllChatRoom();
    }
}