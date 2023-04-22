import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PrismaModule } from "src/prisma/prisma.module";
import { DirectMessageGateway } from "./dm.gateway";
import { DirectMessageService } from "./dm.service";

@Module({
    imports: [PrismaModule, JwtModule],
    controllers: [],
    providers: [DirectMessageService, DirectMessageGateway],
})
export class DirectMessagesModule {}