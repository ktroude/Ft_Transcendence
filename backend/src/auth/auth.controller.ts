// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Controller, Get, Param, Post, Query, Res, Body, Put } from '@nestjs/common';
import { AuthService } from './auth.service';
import { sign } from 'cookie-signature';
import * as speakeasy from 'speakeasy';
import * as QRCode from 'qrcode';
import { UserService } from 'src/user/user.service';
import { HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { User } from '@prisma/client';
import { authenticator } from 'otplib';
import { JwtGuard } from '../auth/guard';
import { UseGuards } from '@nestjs/common';
import * as dotenv from 'dotenv';
dotenv.config();

@Controller({})
export class AuthController {
  constructor(private authService: AuthService, private userService: UserService, private prisma: PrismaService) {}

  @Get('token')
  async getUserData(@Query('code') code: string, @Res() res): Promise<void> {
    const { access_token } = await this.authService.getUserData(code);
    // proto de la ft du dessous:
    //res.cookie(name: string, value: any, options?: CookieOptions): Response
    // const signedAccessToken = sign(access_token, process.env.COOKIE_SECRET); // Signature de la valeur access_token

    res.cookie('access_token', access_token, { httpOnly: false });
    const user = await this.userService.decodeToken(access_token);
    if (await this.userService.get2fastatus(user.id) == true) {
      await this.userService.update2fastatus(user.id, 'lock');
      res.redirect(`http://${process.env.LOCALHOST}:5173/auth/2fa`);
      return;
    }
    res.redirect(`http://${process.env.LOCALHOST}:5173/homepage`);
    return;
  }

  @Put(':id/auth/2fa/lockstatus')
  async update2fastatus(@Param('id') id: string, @Body() body: { lockstatus: string }){
    return await this.userService.update2fastatus(parseInt(id, 10), body.lockstatus);
  }

  @Get(':id/auth/2fa/setup')
  async generate2faSecret(@Param('id') id: string, @Res() res) {
    const secret = authenticator.generateSecret();
    const user = await this.prisma.user.findUnique({
      where: {
        id: parseInt(id, 10)
      }
    });
    const otpauthUrl = authenticator.keyuri(user.firstname, 'Transcendence', secret);
    await this.prisma.user.update({
      where: {
        id: parseInt(id, 10)
      },
      data: {
        FA2secret: secret,
      }
    });
    QRCode.toDataURL(otpauthUrl, (err, imageUrl) => {
      if (err) {
        console.error(err);
        return res.sendStatus(500);
      }
      res.json({ secret: secret, image: imageUrl });
    });
  }

  @Post(':id/auth/2fa/verify')
  async verify2FA(@Param('id') id: string, @Body('code') code: any, @Res() res) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: parseInt(id, 10)
      }
    });
    const isVerified = authenticator.check(code, user.FA2secret);
    return res.json({ isVerified });
  }

}
