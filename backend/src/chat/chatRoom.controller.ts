import { Controller, Get, Headers, Post, Query, UseGuards } from "@nestjs/common";
import { ChatRoomService } from "./chatRoom.service";
import { PrismaService } from "src/prisma/prisma.service";
import { UserService } from "src/user/user.service";
import { JwtGuard } from "src/auth/guard";
import { get } from "http";
import { RouterModule } from "@nestjs/core";
import { async } from "rxjs";
import { BlockService } from "src/block/block.service";

@Controller('chat')
export class ChatRoomController {
    constructor(private prisma: PrismaService,
        private chatRoomService: ChatRoomService,
        private userService: UserService,
        private blockService:BlockService,     
        ) { }

    @Get('getRoom')
    async getAllChatRoom(@Headers('Authorization') cookie: string) {
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
        return array;
    }

    @Get('getMuteBan')
    async handleGetMuted(@Headers('Authorization') cookie: string, @Query('code') id) {
        try {
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
            return {
                muted: room.muted,
                banned: room.banned,
            }
        }
        catch {
            return [];
        }
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
        // ajouter blocked msg
        const room = await this.prisma.chatRoom.findUnique({
            where: { id: parseInt(id, 10) },
            select: { messages: true }
        });
        const blocked = await this.blockService.getAllBlockReturnId(user.id);
        let messages = room.messages;
        for (let i = 0; i  < messages.length; i++){
            for (let j = 0; j < blocked.length; j++) {
                if (messages[i].senderId === blocked[j])
                    messages.splice(i, 1);
            }
        }
        return messages;
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
            where: { id: parseInt(pseudo, 10)},
        });
        const room = await this.prisma.chatRoom.findUnique({
            where: { id: parseInt(idRoom, 10) },
        });
        toSend.room = room.id;
        toSend.id = user.id;
        toSend.pseudo = user.username;

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
        try {

            const token = cookie.split(' ')[1];
            const user = await this.userService.decodeToken(token);
            const room = await this.prisma.chatRoom.findUnique({
                where: { id: parseInt(id, 10) }
            });
            return await this.chatRoomService.isBanned(user, room);
        }
        catch {
            return []
        }
    }

    @Get('getMembers')
    async handleGetMembers(@Headers('Authorization') cookie: string, @Query('code') id) {
        try {
            const token = cookie.split(' ')[1];
            const user = await this.userService.decodeToken(token);
            let room = await this.prisma.chatRoom.findUnique({
				where: { id: parseInt(id, 10) },
                select: {
					members: true,
                    banned:true,
                    muted:true,
					id: true,
                }
			});
				const roume = await this.prisma.chatRoom.findUnique({
					where: {id: room.id},
				})
			let membres = [];
			room.members.forEach(async(elem:any) => {
				membres.push(elem);
			});
			for (let i = 0; i < room.members.length; i++) {
				if (await this.chatRoomService.isOwner(room.members[i], roume) === true)
				room.members[i].wins = 2;
				else if (await this.chatRoomService.isAdmin(room.members[i], roume) === true)
				room.members[i].wins = 1;
				else
				room.members[i].wins = 0;
			}
            return {
                membres: room.members,
                muted: room.muted,
                banned: room.banned,
            };
        }
        catch {
            return {
                membres: [],
                muted: [],
                banned: [],
            };
        }
    }

    @Get('getBlock')
    async handleGetBlock(@Headers('Authorization') cookie: string, @Query('code') id) {
        try {
            const token = cookie.split(' ')[1];
            const user = await this.userService.decodeToken(token);
            const room = await this.prisma.chatRoom.findUnique({
                where: { id: parseInt(id, 10) },
                select: { members: true }
            });
            return room.members;
        }
        catch {
            return []
        }
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
            if (elem.id === user.id) {
                return true;
            }
            return false;
        });
        return check;
    }

}