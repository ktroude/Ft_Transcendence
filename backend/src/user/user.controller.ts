import { Controller, Get, Post, Query, Req, UseGuards } from '@nestjs/common';
import { JwtGuard } from '../auth/guard';
import { User } from '@prisma/client';
import { GetUser } from '../auth/decorator';
import { UserService } from './user.service';

// @UseGuards(JwtGuard)
@Controller('users')
export class UserController {
    constructor(private userService : UserService) {}
    @Get('me')
    getMe( @GetUser() user: User) {
        return user;
    }

    @Post('userInfo')
    async SendUserData(@Query('code') code: string) {
        const user = this.userService.decodeToken(code);
    }

} 



