import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { PrismaClient } from '@prisma/client';
import { BlockService } from 'src/block/block.service';
const jwt = require('jsonwebtoken');
const multer = require('multer');

@Injectable()
export class FriendService{
    constructor(private prisma: PrismaService) {}

    // Finding user
    async getAllFriend(pseudo: string): Promise<[string, number][]> {
        const user = await this.prisma.user.findUnique({
          where: {
            pseudo: pseudo,
          }
        });
      
        if (!user) 
            return null;
        // Go to friend table and find all friends of user
        const friends = await this.prisma.friend.findMany({
          where: {
            user_id: user.id
          },
          select: {
            friend: {
              select: {
                username: true, connected: true,
              }
            }
          }
        });
        
        const friendlists = [];

        friends.forEach(friend => {
            friendlists.push([friend.friend.username, friend.friend.connected]);
        });

        return friendlists;
        
      }      
      
    // Looking if user exist
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

    // Looking if friendship exist
    async existingFriendship(userId: number, friendId: number): Promise<Boolean> {
        const friendship = await this.prisma.friend.findUnique({
            where: {
                user_id_friend_id: {
                    user_id: userId,
                    friend_id: friendId
                }
            }
        });
        if (!friendship)
            return false;
        return true;
    }

    async addFriend(pseudo: string, usernameFriend: string): Promise<User> {
        const user = await this.prisma.user.findUnique({
            where: {
                pseudo: pseudo,
            }
        });
        if (!user)
            return null;
        if (user.username == usernameFriend)
            return null;
        const exist = await this.userExist(usernameFriend);
        if (!exist)
            return null;
        const friend = await this.prisma.user.findUnique({
            where: {
                username: usernameFriend,
            }
        });
        if (!friend)
            return null;
        if (await this.existingFriendship(user.id, friend.id))
            return null;
        const newFriend = await this.prisma.block.findUnique({
            where: {
                user_id_blocked_id: {
                    user_id: user.id,
                    blocked_id: friend.id
                }
            }
        });
        if (newFriend)
            return null;
        await this.createFriendship(user.id, friend.id);
        await this.createFriendship(friend.id, user.id);
        return user;
    }

    // Creating friendship
    async createFriendship(userId: number, friendId: number)
    {
        const newFriend = await this.prisma.friend.create({
            data: {
              user: {
                connect: {id: userId },
              },
              friend: {
                connect: {id: friendId },
              },
            },
          });
          return newFriend;
    }
    
    // Deleting friendship
    async deleteFriendShip(userId: number, friendId: number)
    {
		if (await this.existingFriendship(userId, friendId) == false)
			return;
        const deleteFriend = await this.prisma.friend.delete({
            where: {
                user_id_friend_id: {
                    user_id: userId,
                    friend_id: friendId
                }
            }
        });
        return deleteFriend;
    }

    // Find 2 users and delete the friendship
    async deleteFriend(pseudo: string, usernameFriend: string): Promise<User> {
        if (pseudo == usernameFriend)
            return null;
        const user = await this.prisma.user.findUnique({
            where: {
                pseudo: pseudo
            }
        });
        if (!user)
            return null;
        const friend = await this.prisma.user.findUnique({
            where: {
                username: usernameFriend
            }
        });
        if (!friend)
            return null;
        await this.deleteFriendShip(user.id, friend.id);
        await this.deleteFriendShip(friend.id, user.id);
    }
  }