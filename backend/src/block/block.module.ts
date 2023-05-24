import { Module } from "@nestjs/common";
import { FriendService } from "src/friend/friend.service";
import { UserModule } from "src/user/user.module";
import { BlockController } from "./block.controller";
import { BlockService } from "./block.service";

@Module({
    imports: [UserModule],
    controllers: [BlockController],
    providers: [BlockService, FriendService],})
export class BlockModule {}

