import { Controller, Get, UseGuards, Request, Put, Param, Body, Query } from '@nestjs/common';
import { FriendService } from 'src/friend/friend.service';
import { JwtGuard } from 'src/auth/guard';
import { User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

// Controller for the friend system

@UseGuards(JwtGuard)
@Controller('users')
export class FriendController {
    constructor(private friendService: FriendService, private prisma: PrismaService) {}

    @UseGuards(JwtGuard)
    @Put(':pseudo/friend') // Add a friend
    async addFriend(@Param('pseudo') pseudo: string,@Body() body:{friend: string}): Promise<User> 
    {
        return this.friendService.addFriend(pseudo, body.friend);
    }

    @UseGuards(JwtGuard)
    @Get(':pseudo/getallfriends') // Get all friends
    async getAllFriend(@Param('pseudo') pseudo: string): Promise<[string, number][]>
    {
        return this.friendService.getAllFriend(pseudo);
    }

    @UseGuards(JwtGuard)
    @Get('existingFriendship') // Check if two users are friends or not
    async existingFriendship(@Query('id1') id1: string, @Query('id2') id2: string): Promise<Boolean>
    {
		return this.friendService.existingFriendship(parseInt(id1, 10), parseInt(id2, 10));
    }

    @UseGuards(JwtGuard)
    @Put(':pseudo/deletefriend') // Delete a friend
    async deleteFriend(@Param('pseudo') pseudo: string, @Body() body:{friend: string}): Promise<User>
    {
        return this.friendService.deleteFriend(pseudo, body.friend);
    }
}