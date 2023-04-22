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
        console.log('No token found or wrong');
        // throw error --> redirect to login page
      }
      const user = await this.userService.decodeToken(token);
      return user;
    }

    @UseGuards(JwtGuard)
    @Get(':user/getUser')
    async getUserInfo(@Param('user') user: string): Promise<User> {
        return await this.userService.findUserByUsername(user);
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
    @Get(':user/search')
    async searchUser(@Param('user') searchProfile: string): Promise<Boolean> {
		let toto = await(this.userService.findUserByUsernameBool(searchProfile));
		console.log("searchUser ->", searchProfile, "bool value ->", toto);
        return toto;
	}
}
