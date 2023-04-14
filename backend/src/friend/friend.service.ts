import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
const jwt = require('jsonwebtoken');
const multer = require('multer');

@Injectable()
export class FriendService{
    constructor(private prisma: PrismaService) {}

    async userExist(usernameFriend: string): Promise<Boolean> {
        const user = await this.prisma.user.findUnique({
            where: {
                username: usernameFriend,
            }
        });
        if (!user)
            return false;
        return true;
    }

    async addFriend(pseudo: string, usernameFriend: string): Promise<User> {
        const exist = await this.userExist(usernameFriend);
        if (!exist)
        {
            console.log("IL EXISTE PAS");
            return null;
        }
        const user = await this.prisma.user.findUnique({
            where: {
                pseudo: pseudo,
            }
        });
        if (!user)
            return null;
        const friend = await this.prisma.user.findUnique({
            where: {
                username: usernameFriend,
            }
        });
        if (!friend)
            return null;
        console.log("JAI TROUVER " + friend.pseudo);
        
        return user;
    }
}