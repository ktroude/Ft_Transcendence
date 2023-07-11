import { Controller, Get, UseGuards, Request, Put, Param, Body } from '@nestjs/common';
import { JwtGuard } from 'src/auth/guard';
import { User } from '@prisma/client';
import { BlockService } from './block.service';
import { Query } from '@nestjs/common';
import { UserService } from 'src/user/user.service';

//Controller for the block system

@UseGuards(JwtGuard)
@Controller('users')
export class BlockController {
    constructor (private blockService: BlockService, private userService: UserService) {}

    @UseGuards(JwtGuard)
    @Put(':pseudo/block') // Block a user
    async blockUser(@Param('pseudo') pseudo: string,@Body() body:{block: string}): Promise<User>
    {
        return this.blockService.blockUser(pseudo, body.block);
    }
	
    @UseGuards(JwtGuard)
    @Get(':pseudo/getBlock') // Get all blocked users
    async getBlock(@Param('pseudo') pseudo: string): Promise<string[]> {
		return this.blockService.getAllBlock(pseudo);
    }
	
    @UseGuards(JwtGuard)
    @Put(':pseudo/deleteBlock') // Delete a block
    async deleteBlock(@Param('pseudo') pseudo: string, @Body() body:{block: string}): Promise<User>
    {
        return this.blockService.deleteBlock(pseudo, body.block);
    }

	@UseGuards(JwtGuard)
	@Get(':pseudo/checkBlock') // Check if a user is blocked
	async checkBlock(@Param('pseudo') pseudo: string, @Query('block') block: string): Promise<Boolean>
	{
        const user = await this.userService.findUserByPseudo(pseudo);
        const userBlock = await this.userService.findUserByUsername(block);
        if (!user || !userBlock)
            return false;
        return await this.blockService.existingBlock(user.id, userBlock.id);
	}

    @UseGuards(JwtGuard)
    @Get('getAllBlockReturnId')
    async handleGetAllBlockReturnId(@Query('id') id) {
        return await this.blockService.getAllBlockReturnId(parseInt(id, 10));
    }
}   