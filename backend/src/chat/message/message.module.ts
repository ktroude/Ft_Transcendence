import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { MessageService } from './message.service';

@Module({
  imports: [PrismaModule],
  controllers: [],
  providers: [MessageService],
})
export class MessageModule {}
