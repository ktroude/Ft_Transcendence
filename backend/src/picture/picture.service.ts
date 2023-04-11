
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '@prisma/client';

@Injectable()
export class PictureService {
  constructor(private prisma: PrismaService) {}
  
    async updateFile(user: User, originalname: string) {
      const updatedUser = await this.prisma.user.update({
        where: { id: user.id },
        data: { picture: originalname },
      });
      return updatedUser.picture;
    }

    async findUser(userId: number) {
        return this.prisma.user.findUnique({ where: { id: userId } });
      }
  }
  
