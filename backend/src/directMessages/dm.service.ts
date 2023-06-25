import { Injectable } from "@nestjs/common";
import { User } from "@prisma/client";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class DirectMessageService {
    constructor(private prisma: PrismaService) {}
 
    async createMessage(user:User, content:string, roomId:number) {
    return await this.prisma.directMessage.create({
        data: {
            content: content,
            senderId: user.id,
            senderPseudo: user.username,
            directMessageRoomId: roomId
        }
        });
    }

    async otherUser(user:any, room:any) {
        if (user.id === room.ownerOne.id) {
            return room.ownerTwoId;
        }
        if (user.id == room.ownerTwo) {
            return room.ownerOne.id;
        }
        return null
    }

    async findRoom(user:User, who:User) {
        let room = await this.prisma.directMessageRoom.findFirst({
            where: {
                ownerOneId : user.id,
                ownerTwoId: who.id,
            },
            select: {
                ownerOneId: true,
                ownerTwoId: true,
                messages: true,
                ownerOne: true,
                ownerTwo: true,
                id: true, 
            }
        });
        if (!room) {
            room = await this.prisma.directMessageRoom.findFirst({
                where: {
                    ownerOneId : who.id,
                    ownerTwoId: user.id,
                },
                select: {
                    ownerOneId: true,
                    ownerTwoId: true,
                    messages: true,
                    ownerOne: true,
                    ownerTwo: true,
                    id: true, 
                }
            });
        }
        return room;
    }

	async check_blocked(room) {
		const user1 = await this.prisma.user.findUnique({
			where: {id: room.ownerOneId},
			select: {
				id: true,
				userBlocks: true,
  				blockedUserBlocks: true,
			}
		});
		const user2 = await this.prisma.user.findUnique({
			where: {id: room.ownerTwoId},
			select: {
				id: true,
				userBlocks: true,
  				blockedUserBlocks: true,
			}
		});
		for (let i=0; i<user1.userBlocks.length; i++) {
			if (user1.userBlocks[i].blocked_id === user2.id)
				return true;
		}
		for (let i=0; i<user1.blockedUserBlocks.length; i++) {
			if (user1.blockedUserBlocks[i].blocked_id === user2.id)
				return true;
		}
		return false;
	}

}