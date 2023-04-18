import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { PrismaClient } from '@prisma/client';
const jwt = require('jsonwebtoken');
const multer = require('multer');

@Injectable()
export class BlockService {
  constructor(private prisma: PrismaService) {}

    async createBlock(userId: number, blockId: number) {
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

    async unblock(userId: number, blockId: number)
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

    async deleteBlock(pseudo: string, usernameBlock: string) {
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
       
    async existingBlock(pseudo: string, usernameBlock: string): Promise<Boolean> {
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

    async userExist(usernameBlock: string): Promise<Boolean> {
        const user = await this.prisma.user.findUnique({
            where: {
                username: usernameBlock,
            }
        });
        if (!user)
            return false;
        return true;
    }

    async blockUser(pseudo: string, usernameBlock: string): Promise<User> {
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

    async getAllBlock(pseudo: string): Promise<string[]> {
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
}