import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { PrismaClient } from '@prisma/client';
import { FriendService } from 'src/friend/friend.service';
const jwt = require('jsonwebtoken');
const multer = require('multer');

// Service for the block system

@Injectable()
export class BlockService {
  constructor(private friendService: FriendService, private prisma: PrismaService) {}

    async createBlock(userId: number, blockId: number) { // Create a block relation''
        const block = await this.prisma.block.create({
            data: {
                user: {
                    connect: { id: userId }
                },
                blocked: {
                    connect: { id: blockId }
            }
        }
        });
        if (await this.friendService.existingFriendship(userId, blockId) == false)
            return block;
        else
        {
            await this.friendService.deleteFriendShip(userId, blockId);
            await this.friendService.deleteFriendShip(blockId, userId);
            return block;
        }
    }

    async unblock(userId: number, blockId: number) // Find the block relation and delete it
    {
        const deleteFriend = await this.prisma.block.findUnique({
			where: {
				user_id_blocked_id: {
					user_id: userId,
					blocked_id: blockId
				}
		}});
		if (!deleteFriend) {
			return ;
		}
		const deleted = await this.prisma.block.delete({
                where: {
                    user_id_blocked_id: {
                        user_id: userId,
                        blocked_id: blockId
                    }
            }});
        return deleted;
    }

    async deleteBlock(pseudo: string, pseudoBlock: string) { // Take users looks if they are blocked and delete the block relation
        const user = await this.prisma.user.findUnique({
            where: {
                pseudo: pseudo,
            }
        });
        if (!user)
            return null;
		const userBlock = await this.prisma.user.findUnique({
			where: {
				pseudo: pseudoBlock,
			}
		});
        if (!userBlock)
            return null;
		await this.unblock(user.id, userBlock.id);
		await this.unblock(userBlock.id, user.id);
		return;
    }
       
    async existingBlock(userId: number, userBlockId: number): Promise<Boolean> { // Check if the user is blocked
		const block = await this.prisma.block.findUnique({
            where: {
                user_id_blocked_id: {
                    user_id: userId,
                    blocked_id: userBlockId
                }
            }
        });
        if (!block)
            return false;
        return true;
    }

    async userExist(pseudoBlock: string): Promise<Boolean> { // Check if the user exist
        const user = await this.prisma.user.findUnique({
            where: {
                pseudo: pseudoBlock,
            }
        });
        if (!user)
            return false;
        return true;
    }

    async blockUser(pseudo: string, pseudoBlock: string): Promise<User> { // Search for the users and create the block relation
        if (await this.userExist(pseudoBlock) == false)
            return null;
        const user = await this.prisma.user.findUnique({
            where: {
                pseudo: pseudo,
            }
        });
        if (!user)
            return null;
        const userBlock = await this.prisma.user.findUnique({
            where: {
                pseudo: pseudoBlock,
            }
        });
        if (!userBlock)
            return null;
        if (await this.existingBlock(user.id, userBlock.id))
            return null;
        await this.createBlock(user.id, userBlock.id);
        await this.createBlock(userBlock.id, user.id);
        return user;
    }

    async getAllBlock(pseudo: string): Promise<string[]> { // Get all the blocked users of
        const user = await this.prisma.user.findUnique({
            where: {
                pseudo: pseudo,
            }
        });
        if (!user)
            return null;
        const blocks = await this.prisma.block.findMany({
            where: {
                user_id: user.id
            },
            select: {
                blocked: {
                    select: {
                        username: true
                    }
                }
            }
        });
        return blocks.map(block => block.blocked.username);
    }

    async getAllBlockReturnId(id:number): Promise<number[]> { // Get all the blocked users of and return the id instead of username
        const user = await this.prisma.user.findUnique({
            where: {
                id: id,
            }
        });
        if (!user)
            return null;
        const blocks = await this.prisma.block.findMany({
            where: {
                user_id: user.id
            },
            select: {
                blocked: {
                    select: {
                        id: true
                    }
                }
            }
        });
        return blocks.map(block => block.blocked.id);
    }

    async blockUserId(me:number, toBlock:number): Promise<User> { // Search for the users and create the block relation
        const userToBlock = await this.prisma.user.findUnique({
            where: {id: toBlock}
        })
        const user = await this.prisma.user.findUnique({
            where: {
                id: me,
            }
        });
        if (!user || ! userToBlock || user.id === userToBlock.id)
            return null;
        if (await this.existingBlock(user.id, userToBlock.id))
            return null;
        await this.createBlock(user.id, userToBlock.id);
        return userToBlock;
    }

}