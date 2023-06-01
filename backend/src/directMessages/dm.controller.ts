import { Controller, Get, Headers, Query } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { UserService } from "src/user/user.service";
import { DirectMessageService } from "./dm.service";

@Controller('dm')
export class DirecteMessageController{
constructor(
    private userService: UserService,
    private prisma: PrismaService,
    private dmService: DirectMessageService,
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
        },
        select: {
          ownerOneId: true,
          ownerTwoId: true,
          ownerOne: true,
          ownerTwo: true,
          id: true,
        }
      });
      let customRoom = [];
      for (let i = 0; i < rooms.length; i++) {
        customRoom[i] = rooms[i];
        if (user.id === customRoom[i].ownerOne.id) {
          customRoom[i].name = customRoom[i].ownerTwo.username;
        }
        else {
          customRoom[i].name = customRoom[i].ownerOne.username;
      }
    }
    return {
            rooms: customRoom,
            user: user,
        };
}

@Get('who')
async handleWho(@Headers('Authorization') cookie: String, @Query('id') userId) {
  try {

    let existe = true;
    const token = cookie.split(' ')[1];
  const user = await this.userService.decodeToken(token);
  const who = await this.prisma.user.findUnique({
    where: {id: parseInt(userId, 10)},
  });
  if (!who) {
    return null;
  }
  let room = await this.dmService.findRoom(user, who);
  if (!room) {
    existe = false;
    await this.prisma.directMessageRoom.create({
      data: {
        ownerOneId: user.id,
        ownerTwoId: who.id,
      }
    });
    room = await this.dmService.findRoom(user, who);
  }
  return  {
    room: room,
    msg: existe === true? room.messages : [],
    who: who,
  };
}
catch {
  return null;
}
}






}