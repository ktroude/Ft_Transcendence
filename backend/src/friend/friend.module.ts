import { Module } from "@nestjs/common";
import { BlockService } from "src/block/block.service";
import { FriendController } from "./friend.controller";
import { FriendService } from "./friend.service";

@Module({
    imports: [],
    controllers: [FriendController],
    providers: [FriendService],})
export class FriendModule {}

