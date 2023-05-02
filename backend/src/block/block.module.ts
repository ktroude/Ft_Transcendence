import { Module } from "@nestjs/common";
import { UserModule } from "src/user/user.module";
import { BlockController } from "./block.controller";
import { BlockService } from "./block.service";

@Module({
    imports: [UserModule],
    controllers: [BlockController],
    providers: [BlockService],})
export class BlockModule {}

