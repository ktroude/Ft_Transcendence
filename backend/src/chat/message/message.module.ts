import { Module } from "@nestjs/common";
import { PrismaModule } from "src/prisma/prisma.module";
import { MessageGateway } from "./message.gateway";
import { MessageService } from "./message.service";

@Module({
    imports: [PrismaModule],
    controllers: [],
    providers: [MessageService, MessageGateway]
})
export class MessageModule {}