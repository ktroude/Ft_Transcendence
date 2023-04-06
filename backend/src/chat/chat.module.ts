import { Module } from '@nestjs/common';
import { ChatRoomModule } from './chatRoom/chatRoom.module';
import { MessageModule } from './message/message.module';

@Module({
  imports: [ChatRoomModule, MessageModule],
  controllers: [],
  providers: [],
})
export class ChatModule {}
