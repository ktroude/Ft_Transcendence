import { SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Message } from "@prisma/client";
import { Server } from "socket.io";
import { MessageService } from "../message/message.service";


@WebSocketGateway({
    cors: {
        origin: "*"
    }
})
export class ChatRoomGateway {
//   constructor(private messageService: MessageService) {}

  @WebSocketServer()
  server: Server;

//   @SubscribeMessage('newMessage')
//   handleEvent(client: any, newMessage: Message) {
//     const message = this.messageService.createMessage(newMessage.content, newMessage.senderId, newMessage.senderPseudo, newMessage.chatRoomId);
//     // Enregistrement du message en base de données avec Prisma

//     this.server.to(newMessage.chatRoomId).emit('newMessage', message);
//     // Diffusion du message à tous les utilisateurs de la chatroom
//   }
}