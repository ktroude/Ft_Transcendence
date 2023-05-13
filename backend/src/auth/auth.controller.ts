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
      res.redirect('http://localhost:5173/auth/2fa');
      return;
    }
    res.redirect('http://localhost:5173/homepage');
    return;
  }

  @Get(':id/auth/2fa/setup')
  async generate2faSecret(@Param('id') id: string, @Res() res) {
    const secret = speakeasy.generateSecret({ length: 20 });
    const user = await this.prisma.user.findUnique({
      where: {
        id: parseInt(id, 10)
      }
    });
    const sec = secret.base32;
    const otpauthUrl = `otpauth://totp/Transcendence:${user.firstname}?secret=${encodeURIComponent(sec)}&issuer=Transcendence`;
    await this.prisma.user.update({
      where: {
        id: parseInt(id, 10)
      },
      data: {
        FA2secret: sec,
      }
    });
    QRCode.toDataURL(otpauthUrl, (err, imageUrl) => {
      if (err) {
        console.error(err);
        return res.sendStatus(500);
      }
      res.json({ secret: sec, image: imageUrl });
    });
  }

  @Post(':id/auth/2fa/verify')
  async verify2FA(@Param('id') id: string, @Body() body: {code: string}, @Res() res) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: parseInt(id, 10)
      }
    });
  
    console.log(body.code)
    const isVerified = speakeasy.totp.verify({
      secret: user.FA2secret,
      encoding: 'base32',
      token: user.FA2code,
      window: 20,
    });
  
    if (!isVerified) {
      throw new HttpException('Invalid verification code', HttpStatus.UNAUTHORIZED);
    }
    res.redirect('http://localhost:5173/homepage');
  }
}