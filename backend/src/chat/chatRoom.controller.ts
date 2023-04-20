import { Controller, Get, Headers, Post, Query, UseGuards } from "@nestjs/common";
import { ChatRoomService } from "./chatRoom.service";
import { PrismaService } from "src/prisma/prisma.service";
import { UserService } from "src/user/user.service";
import { JwtGuard } from "src/auth/guard";
import { get } from "http";
import { RouterModule } from "@nestjs/core";

@Controller('chat')
export class ChatRoomController {
    constructor(private prisma: PrismaService,
        private chatRoomService: ChatRoomService,
        private userService: UserService) { }

    @Get('getRoom')
    async getAllChatRoom(@Headers('Authorization') cookie: string) {
        console.log("getAllChatRoom");
        const token = cookie.split(' ')[1];
        const user = await this.userService.decodeToken(token);
        let rooms: any = await this.chatRoomService.getAllChatRoom();
        let array = [];
        for (let elem of rooms) {
            const isMember = await this.chatRoomService.isMember(user, elem);
            if (elem.password.length > 0)
                elem.password = true;
            else
                elem.password = false;
            if (elem.private == false) {
                array.push(elem);
            }
            if (elem.private == true && isMember === true) {
                array.push(elem);
            }
        }
        await Promise.all(array);
        // const ret = array.map(elem => ({
        //     name: elem.name,
        //     private: elem.private,
        //     id: elem.id,
        //     ownerId: elem.ownerId,
        console.log('arrrrray =', array);
        return array;
    }

    @Get('getMuteBan')
    async handleGetMuted(@Headers('Authorization') cookie: string, @Query('code') id) {
        const token = cookie.split(' ')[1];
        const user = await this.userService.decodeToken(token);
        const room = await this.prisma.chatRoom.findUnique({
            where: { id: parseInt(id, 10) },
            select: {
                muted: true,
                banned: true,
                admin: true,
            }
        });
        const admin = room.admin.find((obj) => obj.id === user.id);
        if (admin) {
            return {
                muted: room.muted,
                banned: room.banned,
            }
        }
        else
            return [];
    }

    @Get('userInfo')
    async handleUser(@Headers('Authorization') cookie: string, @Query('code') id) {
        const token = cookie.split(' ')[1];
        const user = await this.userService.decodeToken(token);
        const room = await this.prisma.chatRoom.findUnique({
            where: { id: parseInt(id, 10) }
        });
        if (room && await this.chatRoomService.isOwner(user, room) === true) {
            return 2;
        }
        else if (room && await this.chatRoomService.isAdmin(user, room) === true) {
            return 1;
        }
        else if (room && await this.chatRoomService.isMuted(user, room) === true) {
            return -1
        }
        else if (room && await this.chatRoomService.isBanned(user, room) === true) {
            return -2
        }
        else if (room && await this.chatRoomService.isMember(user, room) === true) {
            return 0;
        }
    }

    @Get('getMessages')
    async handleGetMessage(@Headers('Authorization') cookie: string, @Query('code') id) {
        const token = cookie.split(' ')[1];
        const user = await this.userService.decodeToken(token);
        const room = await this.prisma.chatRoom.findUnique({
            where: { id: parseInt(id, 10) },
            select: { messages: true }
        });
        return room.messages;
    }

    @Get('UserbyRoom')
    async handleUserbyRoom(@Headers('Authorization') cookie: string, @Query('room') idRoom, @Query('pseudo') pseudo) {
        let toSend = {
            id: 0,
            pseudo: '',
            status: -3,
            room: 0
        };
        const user = await this.prisma.user.findUnique({
            where: { pseudo: pseudo },
        });
        const room = await this.prisma.chatRoom.findUnique({
            where: { id: parseInt(idRoom, 10) },
        });
        toSend.room = room.id;
        toSend.id = user.id;
        toSend.pseudo = user.pseudo;

        if (await this.chatRoomService.isOwner(user, room) === true) {
            toSend.status = 2;
        }
        else if (await this.chatRoomService.isAdmin(user, room) === true) {
            toSend.status = 1;
        }
        else if (await this.chatRoomService.isMuted(user, room) === true) {
            toSend.status = -1
        }
        else if (await this.chatRoomService.isBanned(user, room) === true) {
            toSend.status = -2
        }
        else if (await this.chatRoomService.isMember(user, room) === true) {
            toSend.status = 0;
        }
        return toSend;
    }

    @Get('getBan')
    async handleGetBanBoolean(@Headers('Authorization') cookie: string, @Query('code') id) {
        const token = cookie.split(' ')[1];
        const user = await this.userService.decodeToken(token);
        const room = await this.prisma.chatRoom.findUnique({
            where: { id: parseInt(id, 10) }
        });
        return await this.chatRoomService.isBanned(user, room);
    }

    @Get('getMembers')
    async handleGetMembers(@Headers('Authorization') cookie: string, @Query('code') id) {
        const token = cookie.split(' ')[1];
        const user = await this.userService.decodeToken(token);
        const room = await this.prisma.chatRoom.findUnique({
            where: { id: parseInt(id, 10) },
            select: { members: true }
        });
        return room.members;
    }

    @Get('getBlock')
    async handleGetBlock(@Headers('Authorization') cookie: string, @Query('code') id) {
        const token = cookie.split(' ')[1];
        const user = await this.userService.decodeToken(token);
        const room = await this.prisma.chatRoom.findUnique({
            where: { id: parseInt(id, 10) },
            select: { members: true }
        });
        return room.members;
    }

    @Get('IsPvAndMember')
    async handleIsPvAndMember(@Headers('Authorization') cookie: string, @Query('room') roomId) {
        const token = cookie.split(' ')[1];
        const user = await this.userService.decodeToken(token);
        const room = await this.prisma.chatRoom.findUnique({
            where: { id: parseInt(roomId, 10) },
            select: { members: true }
        });
        const check = room.members.forEach(elem => {
            console.log('elem ==', elem.id)
            console.log('user ==', user.id)
            if (elem.id === user.id) {
                console.log('je suis ici meme')
                return true;
            }
            return false;
        });
        return check;
    }

}