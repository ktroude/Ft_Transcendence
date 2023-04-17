import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ChatRoomModule } from './chat/chatRoom.module';
import { PictureModule } from './picture/picture.module';
import { UserModule } from './user/user.module';
import { FriendModule } from './friend/friend.module';
import { WebsocketModule } from './websocket/websocket.module';

@Module({
  imports: [AuthModule, ChatRoomModule, UserModule, PictureModule, FriendModule, WebsocketModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
