import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { PrismaClient } from '@prisma/client';
const jwt = require('jsonwebtoken');
const multer = require('multer');

// Service for the block system

@Injectable()
export class BlockService {
  constructor(private prisma: PrismaService) {}

    async createBlock(userId: number, blockId: number) { // Create a block relation
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
        if (!block)
            return null;
        return block;
    }

    async unblock(userId: number, blockId: number) // Find the block relation and delete it
    {
        const deleteFriend = this.prisma.block.findUnique({
			where: {
				user_id_blocked_id: {
					user_id: userId,
					blocked_id: blockId
				}
		}});
		if (!deleteFriend) {
			console.log("Cannot unblock, friend is not blocked");
			return ;
		}
		await this.prisma.block.delete({
            where: {
                user_id_blocked_id: {
                    user_id: userId,
                    blocked_id: blockId
                }
        }});
        return deleteFriend;
    }

    async deleteBlock(pseudo: string, usernameBlock: string) { // Take users looks if they are blocked and delete the block relation
        const user = await this.prisma.user.findUnique({
            where: {
                pseudo: pseudo,
            }
        });
        if (!user)
            return null;
        if (user.username === usernameBlock)
            return null;
			const userBlock = await this.prisma.user.findUnique({
				where: {
					username: usernameBlock,
				}
			});
		const isBlocked = await this.existingBlock(pseudo, usernameBlock);
		if (isBlocked == false)
			return null;
		await this.unblock(user.id, userBlock.id);
		return;
    }
       
    async existingBlock(pseudo: string, usernameBlock: string): Promise<Boolean> { // Check if the user is blocked
		const user = await this.prisma.user.findUnique({
            where: {
                pseudo: pseudo,
            }
        });
        if (!user)
            return false;
        if (user.username === usernameBlock)
            return false;
        console.log("userBlock: " + usernameBlock);
		const userBlock = await this.prisma.user.findUnique({
			where: {
				pseudo: usernameBlock,
			}
		});
		const block = await this.prisma.block.findUnique({
            where: {
                user_id_blocked_id: {
                    user_id: user.id,
                    blocked_id: userBlock.id
                }
            }
        });
        if (!block)
            return false;
        return true;
    }

    async userExist(usernameBlock: string): Promise<Boolean> { // Check if the user exist
        const user = await this.prisma.user.findUnique({
            where: {
                username: usernameBlock,
            }
        });
        if (!user)
            return false;
        return true;
    }

    async blockUser(pseudo: string, usernameBlock: string): Promise<User> { // Search for the users and create the block relation
        if (await this.userExist(usernameBlock) == false)
            return null;
        const user = await this.prisma.user.findUnique({
            where: {
                pseudo: pseudo,
            }
        });
        if (!user)
            return null;
        if (user.username === usernameBlock)
            return null;
        const userBlock = await this.prisma.user.findUnique({
            where: {
                username: usernameBlock,
            }
        });
        if (!userBlock)
            return null;
        if (await this.existingBlock(pseudo, usernameBlock))
            return null;
        await this.createBlock(user.id, userBlock.id);
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




}