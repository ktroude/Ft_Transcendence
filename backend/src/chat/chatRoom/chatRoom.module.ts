import { Module } from "@nestjs/common";
import { PrismaModule } from "src/prisma/prisma.module";
import { ChatRoomGateway } from "./chatRoom.gateway";
import { ChatRoomService } from "./chatRoom.service";

@Module({
    imports: [PrismaModule],
    controllers: [],
    providers: [ChatRoomService, ChatRoomGateway],
})

export class ChatRoomModule {}