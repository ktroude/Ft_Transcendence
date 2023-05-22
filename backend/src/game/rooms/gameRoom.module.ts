import { Module } from "@nestjs/common";
import { Room } from "colyseus";
import { PrismaModule } from "src/prisma/prisma.module";
import { PrismaService } from "src/prisma/prisma.service";
import { UserModule } from "src/user/user.module";
import { UserService } from "src/user/user.service";
import { gameRoomService } from "./gameRoom";

@Module({
    imports: [],
    controllers: [],
    providers: [gameRoomService, UserService, PrismaService],
})
export class gameRoom {}