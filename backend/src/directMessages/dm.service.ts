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
            senderPseudo: user.pseudo,
            directMessageRoomId: roomId
        }
        });
    }

    async otherUser(user:any, room:any) {
        if (user.id === room.ownerOne.id) {
            return room.ownerTwo;
        }
        if (user.id == room.ownerTwo) {
            return room.ownerOne;
        }
        return null;
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




}