import { Injectable } from '@nestjs/common';
import { ChatRoom, User } from '@prisma/client';
import { Prisma } from '@prisma/client';
import { all } from 'axios';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ChatRoomService {
  constructor(private prisma: PrismaService) { }

  async isAdmin(user: User, chatRoom: ChatRoom): Promise<Boolean> {
    const isAdmin = await this.prisma.chatRoom
      .findUnique({ where: { id: chatRoom.id } })
      .admin({ where: { id: user.id } })
    const finded = isAdmin.find((obj) => obj.id === user.id);
    if (finded)
      return true;
    else
      return false;
  }

  async isOwner(user:any, chatRoom:any): Promise<boolean> {
    const isOwner = await this.prisma.chatRoom.findUnique({
      where: { id: chatRoom.id },
      select: { owner: { select: { id: true } } },
    });
    if (isOwner.owner.id === user.id)
      return true;
    else
      return false;
  }

  async isMuted(user:any, chatRoom:any): Promise<boolean> {
    try {

      const isMuted = await this.prisma.chatRoom
      .findUnique({ where: { id: chatRoom.id } })
      .muted({ where: { id: user.id } })
      const finded = isMuted.find((obj) => obj.id === user.id);
      if (finded)
      return true;
    else
      return false;
    }
    catch {
      return false;
    }
  }

  async isBanned(user:any, chatRoom:any): Promise<boolean> {
    const isBanned = await this.prisma.chatRoom
      .findUnique({ where: { id: chatRoom.id } })
      .banned({ where: { id: user.id } })
    const finded = isBanned.find((obj) => obj.id === user.id);
    if (finded)
      return true;
    else
      return false;
  }

  async isMember(user:any, chatRoom:any): Promise<boolean> {
    const isMember = await this.prisma.chatRoom
      .findUnique({ where: { id: chatRoom.id } })
      .members({ where: { id: user.id } })
    const finded = isMember.find((obj) => obj.id === user.id);
    if (finded)
      return true;
    else
      return false;
  }

  async getAllChatRoom() {
    const rooms = await this.prisma.chatRoom.findMany({});
    return rooms;
  }

  // async createChatRoom(user: User) {
  //   const chatRoomData: Prisma.ChatRoomCreateInput = {
  //     owner: { connect: { id: user.id } },
  //     members: { connect: [{ id: user.id }] },
  //     admin: { connect: [{ id: user.id }] },
  //     muted: { connect: [] },
  //     banned: { connect: [] },
  //     messages: { connect: [] },
  //   };
  // 
  //   return await this.prisma.chatRoom.create({
  //     data: chatRoomData,
  //   });
  // }

  async createMessage(text: string, user: any, chatRoom: any) {
	try{

		const createdMessage = await this.prisma.message.create({
			data: {
				content: text,
				senderId: user.id,
				senderPseudo: user.username,
				chatRoom: { connect: { id: chatRoom.id } },
			},
		});
		
		await this.prisma.chatRoom.update({
			where: { id: chatRoom.id },
			data: { messages: { connect: { id: createdMessage.id } } },
		});
		return createdMessage;
	}
	catch {
		
	}
  }

  async getUniqueChatRoom(idChatRoom: number) {
    return this.prisma.chatRoom.findUnique({
      where: {
        id: idChatRoom,
      },
    });
  }

	check_array(num:any, blocked:any[]) {
		for (let i=0; i<blocked.length; i++) {
			if (blocked[i] === num) {
				return true;
			}
		}
		return false;
	}

}
