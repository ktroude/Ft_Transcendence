import { Controller, Get, Header, Headers, Post, Query, Req, UseGuards } from '@nestjs/common';
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
}
