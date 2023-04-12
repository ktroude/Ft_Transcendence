import { Controller, Get, UseGuards, Request, Put, Param, Body } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { JwtGuard } from 'src/auth/guard';
import { User } from '@prisma/client';
@UseGuards(JwtGuard)
@Controller()
export class PictureController {
    constructor(private userService: UserService) {}

    @UseGuards(JwtGuard)
    @Get('get-image-url')
    async getImageUrl(@Request() req): Promise<string> {
      const user = await this.userService.findUserByPseudo(req.user.pseudo);
      const imageUrl = user.picture;
      return imageUrl;
    }

    @UseGuards(JwtGuard)
    @Put('/users/:id/picture')
    async updateProfilePicture(@Param('id') id: number,@Body('picture') picture: string): Promise<User> {
        return this.userService.changeNewProfilePicture(id, picture);
    }
}