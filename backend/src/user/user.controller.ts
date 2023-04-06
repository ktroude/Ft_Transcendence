import { Controller, Get, Header, Post, Query, Req, UseGuards } from '@nestjs/common';
import { JwtGuard } from '../auth/guard';
import { User } from '@prisma/client';
import { GetUser } from '../auth/decorator';
import { UserService } from './user.service';

// @UseGuards(JwtGuard)
@Controller('users')
export class UserController {
    constructor(private userService: UserService) {}

  @Get('yo')
  yo(){
    console.log("yo");
    
  }

  @Get('me')
  getMe(@GetUser() user: User) {
    return user;
  }

  @Get('userInfo')
  @Header('Access-Control-Allow-Origin', '*')
  async SendUserData(@Query('code') code: string) {
    console.log(code);
    
    const user = this.userService.decodeToken(code);
    console.log({user});
    
    return user;
  }

}
