// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Controller, Get, Param, Post, Query, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { sign } from 'cookie-signature';

@Controller({})
export class AuthController {
  constructor(private authService: AuthService) {}

  @Get('token')
  async getUserData(@Query('code') code: string, @Res() res): Promise<void> {
    const { access_token } = await this.authService.getUserData(code);
    // proto de la ft du dessous:
    //res.cookie(name: string, value: any, options?: CookieOptions): Response
    const signedAccessToken = sign(access_token, process.env.COOKIE_SECRET); // Signature de la valeur access_token
    res.cookie('access_token', signedAccessToken, { httpOnly: false });
    res.redirect('http://localhost:5173/homepage');
    return;
  }
}
