import { Controller, Get, UseGuards, Request, Put, Param, Body } from '@nestjs/common';
import { JwtGuard } from 'src/auth/guard';
import { User } from '@prisma/client';
import { BlockService } from './block.service';

@UseGuards(JwtGuard)
@Controller('users')
export class BlockController {
    constructor (private blockService: BlockService) {}

    @UseGuards(JwtGuard)
    @Put(':pseudo/block')
    async blockUser(@Param('pseudo') pseudo: string,@Body() body:{block: string}): Promise<User>
    {
        return this.blockService.blockUser(pseudo, body.block);
    }

    @UseGuards(JwtGuard)
    @Get(':pseudo/getBlock')
    async getBlock(@Param('pseudo') pseudo: string): Promise<string[]> {
        return this.blockService.getAllBlock(pseudo);
    }

    // @UseGuards(JwtGuard)
    // @Put(':pseudo/deleteBlock')
    // async deleteBlock(@Param('pseudo') pseudo: string, @Body() body:{block: string}): Promise<User>
    // {
    //     return this.blockService.deleteBlock(pseudo, body.block);
    // }
}   