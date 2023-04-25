import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PrismaModule } from "src/prisma/prisma.module";
import { UserModule } from "src/user/user.module";
import { DirecteMessageController } from "./dm.controller";
import { DirectMessageGateway } from "./dm.gateway";
import { DirectMessageService } from "./dm.service";

@Module({
    imports: [PrismaModule, JwtModule, UserModule],
    controllers: [DirecteMessageController],
    providers: [DirectMessageService, DirectMessageGateway],
})
export class DirectMessagesModule {}