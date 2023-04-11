import { Controller, Get, Headers, Post, UseGuards } from "@nestjs/common";
import { ChatRoomService } from "./chatRoom.service";
import { PrismaService } from "src/prisma/prisma.service";
import { UserService } from "src/user/user.service";
import { JwtGuard } from "src/auth/guard";

@Controller('chat')
export class ChatRoomController {
    constructor(private prisma:PrismaService ,
                private chatRoomService: ChatRoomService,
                private userService: UserService) {}

    @Get('getRoom')
    async getAllChatRoom(@Headers('Authorization') cookie: string) {
        console.log("getAllChatRoom");
        const token = cookie.split(' ')[1];
        const user = await this.userService.decodeToken(token);
        let rooms = await this.chatRoomService.getAllChatRoom();
        const array = [];
        rooms.forEach(async elem => {
            if (elem.private == false)
            array.push(elem);
            if (elem.private == true && await this.chatRoomService.isMember(user, elem) === true)
            array.push(elem);
        });
        console.log(array);
        const ret = array.map(elem => ({
            name: elem.name,
            private: elem.private,
            id: elem.id,
            ownerId: elem.ownerId,
        }));
        console.log(ret);
        return ret;
    }
}