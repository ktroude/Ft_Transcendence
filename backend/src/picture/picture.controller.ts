import { Controller, Post, UseInterceptors, UploadedFile, Req } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';
import { PictureService } from './picture.service';
import { Body } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Controller()
export class PictureController {
  constructor(private readonly pictureService: PictureService) {}

  @Post('upload')
@UseInterceptors(FileInterceptor('file'))
async uploadFile(@UploadedFile() file: Express.Multer.File, @Body() body: { userId: number }) {
    const { originalname, buffer } = file;
    const user = await this.pictureService.findUser(body.userId);
    const picture = await this.pictureService.updateFile(user, originalname);
  
    // Return the uploaded picture
    return picture;
  }  
}

