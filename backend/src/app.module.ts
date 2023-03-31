import { Module } from '@nestjs/common';
import { WebSocketGateway } from '@nestjs/websockets';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { ChatModule } from './chat/chat.module';
import { GameModule } from './game/game.module';

@Module({
  imports: [AuthModule, UserModule, GameModule, ChatModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
