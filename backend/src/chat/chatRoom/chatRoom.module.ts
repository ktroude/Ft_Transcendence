import { Module } from "@nestjs/common";
import { PrismaModule } from "src/prisma/prisma.module";
import { UserModule } from "src/user/user.module";
import { UserService } from "src/user/user.service";
import { MessageModule } from "../message/message.module";
import { MessageService } from "../message/message.service";
import { ChatRoomGateway } from "./chatRoom.gateway";
import { ChatRoomService } from "./chatRoom.service";

@Module({
    imports: [PrismaModule, MessageModule, UserModule],
    controllers: [],
    providers: [ChatRoomService, ChatRoomGateway, MessageService, UserService],
})

export class ChatRoomModule {}