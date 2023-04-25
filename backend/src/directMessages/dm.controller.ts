import { Controller, Get, Headers } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { UserService } from "src/user/user.service";

@Controller('dm')
export class DirecteMessageController{
constructor(
    private userService: UserService,
    private prisma: PrismaService,
) {}

@Get('getRoomData')
async handleRoomData(@Headers('Authorization') cookie: String) {
    const token = cookie.split(' ')[1];
    const user = await this.userService.decodeToken(token);
    const rooms = await this.prisma.directMessageRoom.findMany({
        where: { 
          OR: [
            { ownerOneId: user.id },
            { ownerTwoId: user.id },
          ],
        }
      });
    return {
            rooms: rooms,
            user: user,
        };
}







}