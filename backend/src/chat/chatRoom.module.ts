import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PrismaModule } from "src/prisma/prisma.module";
import { UserModule } from "src/user/user.module";
import { UserService } from "src/user/user.service";
import { ChatRoomController } from "./chatRoom.controller";
import { ChatRoomGateway } from "./chatRoom.gateway";
import { ChatRoomService } from "./chatRoom.service";

@Module({
    imports: [PrismaModule, UserModule, JwtModule],
    controllers: [ChatRoomController],
    providers: [ChatRoomService, ChatRoomGateway, UserService],
})

export class ChatRoomModule {}