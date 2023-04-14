import { Controller, Get, UseGuards, Request, Put, Param, Body } from '@nestjs/common';
import { FriendService } from 'src/friend/friend.service';
import { JwtGuard } from 'src/auth/guard';
import { User } from '@prisma/client';

@UseGuards(JwtGuard)
@Controller('users')
export class FriendController {
    constructor(private friendService: FriendService) {}

    @UseGuards(JwtGuard)
    @Put(':pseudo/friend')
  async addFriend(@Param('pseudo') pseudo: string,@Body() body:{friend: string}): Promise<User> 
  {
    return this.friendService.addFriend(pseudo, body.friend);
  }
}