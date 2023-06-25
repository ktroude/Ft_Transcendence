import { Controller, Get, Header, Headers, Post, Query, Req, UseGuards, Redirect } from '@nestjs/common';
import { Param, Body, Put } from '@nestjs/common';
import { JwtGuard } from '../auth/guard';
import { User } from '@prisma/client';
import { GetUser } from '../auth/decorator';
import { UserService } from './user.service';

@UseGuards(JwtGuard)
@Controller('users')
export class UserController {
    constructor(private userService: UserService) {}

@UseGuards(JwtGuard)
    @Get('userInfo')
    async SendUserData(@Headers('Authorization') cookie: string) {
      const token = cookie.split(' ')[1];
      if (!token || cookie.split(' ')[0] != 'Bearer' || cookie.split(' ').length > 2) {
        location.href = '/';
      }
      const user = await this.userService.decodeToken(token);
      return user;
    }

    @UseGuards(JwtGuard)
    @Get(':user/getUser')
    async getUserInfo(@Param('user') user: string): Promise<User> {
        const userId = parseInt(user, 10);
        if (userId > 2147483647)
            return null;
        else
            return await this.userService.findUserById(userId);
    }

    @Get(':user/getUserbyPseudo')
    async getUserInfoPseudo(@Param('user') user: string): Promise<User> {
        return await this.userService.findUserByPseudo(user);
    }

    @UseGuards(JwtGuard)
    @Put(':pseudo/newPseudo')
    async updatePseudo(@Param('pseudo') pseudo: string, @Body() body: { user: User, newPseudo: string }): Promise<User> {
        return this.userService.updatePseudo(body.user, body.newPseudo);
    }

    @UseGuards(JwtGuard)
    @Get(':id/get2fa/lockstatus')
    async get2faLockStatus(@Param('id') user: string): Promise<Boolean> {
        return await this.userService.get2faLockStatus(parseInt(user,10));
    }
    
    @UseGuards(JwtGuard)
    @Get(':id/get2fa')
    async get2fa(@Param('id') user: string): Promise<Boolean> {
        return await this.userService.get2fastatus(parseInt(user,10));
    }

    @UseGuards(JwtGuard)
    @Get('getRoomId')
    async handleGetRoomId() {
        const resp = await this.userService.handleGetRoomId();
        return {response:resp};
    }

    @UseGuards(JwtGuard)
    @Put(':id/enable2fa')
    async enable2fa(@Param('id') id: string, @Body() body: {status : string, codestring: string}): Promise<User> {
        return await this.userService.enable2FA(parseInt(id,10), body.status, body.codestring);
    }

    @UseGuards(JwtGuard)
    @Get(':user/search')
    async searchUser(@Param('user') searchProfile: string): Promise<User> {
        return await this.userService.findUserByUsername(searchProfile);
	}

    @UseGuards(JwtGuard)
    @Get(':id/history')
    async getHistory(@Param('id') id: string, @Headers('Authorization') cookie: string,) {
        return await this.userService.getHistory(parseInt(id,10));
	}
}
