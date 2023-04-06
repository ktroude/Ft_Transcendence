import { SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Message } from "@prisma/client";
import { Server } from "socket.io";
import { UserService } from "src/user/user.service";
import { MessageService } from "../message/message.service";
import { ChatRoomService } from "./chatRoom.service";

@WebSocketGateway({
    cors: {
        origin: "*"
    }
})
export class ChatRoomGateway {
    @WebSocketServer()
    server:Server;

    constructor( private messageService:    MessageService,
        private chatRoomService:            ChatRoomService,
        private userService:                UserService,
      ) {}

      @SubscribeMessage('newMessage')
      async handleEvent(client: any, newMessage: Message, ) {
        const chatRoom = await this.chatRoomService.getUniqueChatRoom(newMessage.chatRoomId);
        const sender = await this.userService.findUserById(newMessage.senderId);
        const message = this.messageService.createMessage(newMessage.content, sender, chatRoom);
        // Enregistrement du message en base de données avec Prisma
    
        this.server.to(newMessage.chatRoomId.toString()).emit('newMessage', message);
      }

}

