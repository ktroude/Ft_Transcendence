import { Module } from "@nestjs/common";
import { PrismaModule } from "src/prisma/prisma.module";
import { MessageModule } from "../message/message.module";
import { ChatRoomController } from "./chatRoom.controller";
import { ChatRoomGateway } from "./chatRoom.gateway";
import { ChatRoomService } from "./chatRoom.service";

@Module({
    imports: [PrismaModule, MessageModule],
    controllers: [ChatRoomController],
    providers: [ChatRoomService, ChatRoomGateway],
})

export class ChatRoomModule {}