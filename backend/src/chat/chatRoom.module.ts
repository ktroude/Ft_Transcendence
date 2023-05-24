import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from 'src/prisma/prisma.module';
import { UserModule } from 'src/user/user.module';
import { UserService } from 'src/user/user.service';
import { ChatRoomController } from './chatRoom.controller';
import { ChatRoomGateway } from './chatRoom.gateway';
import { BlockService } from 'src/block/block.service';
import { ChatRoomService } from './chatRoom.service';
import { FriendService } from 'src/friend/friend.service';

@Module({
  imports: [PrismaModule, JwtModule],
  controllers: [ChatRoomController],
  providers: [ChatRoomService, ChatRoomGateway, UserService, BlockService, FriendService],
})
export class ChatRoomModule {}
