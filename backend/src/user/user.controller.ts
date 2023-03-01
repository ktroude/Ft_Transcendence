import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthGuard } from '@nestjs/passport';
import { User } from '@prisma/client';
import { Request } from 'express';
import { GetUser } from 'src/auth/decorator';

@Controller('users')
export class UserController {
    @UseGuards(JwtModule)
    @Get('me')
    getMe( @GetUser() user: User, @GetUser('email') email: string ) {
        return user;
    }
    
} 

