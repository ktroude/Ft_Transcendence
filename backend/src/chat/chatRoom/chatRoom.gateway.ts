import { SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Message, User } from "@prisma/client";
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
   constructor( private messageService:   MessageService,
                private chatRoomService:  ChatRoomService,
                private userService:      UserService
              ) {}

  @WebSocketServer()
  server: Server;

  @SubscribeMessage('newMessage')
  async handleEvent(client: any, newMessage: Message, ) {

    const chatRoom = await this.chatRoomService.getUniqueChatRoom(newMessage.chatRoomId);
    const sender = await this.userService.findUserById(newMessage.senderId);
    // Ces deux variables necessaire? J'ai peur que ca prenne trop de temps lors d'envoie de message a chaque fois
    // modifier le proto de createMessage? Ca reviendrais au meme, a voir donc

    const message = this.messageService.createMessage(newMessage.content, sender, chatRoom);
    // Enregistrement du message dans la base de données avec Prisma

    this.server.to(newMessage.chatRoomId.toString()).emit('newMessage', message);
    // Diffusion du message à tous les utilisateurs de la chatroom
  }


  @SubscribeMessage('newConnexion')
  handleNewConnexion(client: any, user: User) {
    
  }

}