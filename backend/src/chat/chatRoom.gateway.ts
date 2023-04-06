import { JwtService } from "@nestjs/jwt";
import { ConnectedSocket, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Message } from "@prisma/client";
import { Server, Socket } from "socket.io";
import { UserService } from "src/user/user.service";
import { ChatRoomService } from "./chatRoom.service";
import * as cookie from 'cookie';

@WebSocketGateway({
    cors: {
        origin: "*"
    }
})
export class ChatRoomGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {  
  constructor(  private chatRoomService: ChatRoomService,
                private userService: UserService,
                private jwt: JwtService,

              ) {}

    afterInit(server: Server) {
      console.log('WebSocket initialized');
    }    


    @WebSocketServer()
    server:Server;

    private Client : any = [];

    handleConnection(client: Socket) {
      console.log(client.handshake);
      
      // const cookieheader = client.handshake.headers.cookie;
      // const cookies = cookie.parse(cookieheader);
      // const accesstoken = cookies.access_token;
      // console.log(accesstoken);
    }

    handleDisconnect(client: any) {
      
    }

    @SubscribeMessage('test')
    async test(socket: Socket) {
      // const cookieHeader = socket.handshake.headers.cookie;
      // const cookies = cookie.parse(cookieHeader);
      // const accessToken = cookies.access_token;
      // console.log(accessToken);


    }
    
    
    
    
    
    


    // @SubscribeMessage('createChatRoom')
    //   handlecreatChatRoom(@ConnectedSocket() client) {
    //     {
    //       // Récupérer la chaîne de cookies à partir de l'en-tête 'cookie'
    //       const cookieString = client.handshake.headers.cookie;
          
    //       // Parser les cookies avec la bibliothèque 'cookie'
    //       const cookie = require('cookie');
    //       const cookies = cookie.parse(cookieString);
          
    //       // Récupérer la valeur de l'objet souhaité en fonction de son nom
    //       const myObjectValue = cookies['access_token'];
          
    //       // Utiliser la valeur récupérée
    //       console.log(myObjectValue);
    //     }
    //   }


      // @SubscribeMessage('newMessage')
      // async displayNewMessage(client: any, newMessage: Message, ) {
      //   const chatRoom = await this.chatRoomService.getUniqueChatRoom(newMessage.chatRoomId);
      //   const sender = await this.userService.findUserById(newMessage.senderId);
      //   const message = this.chatRoomService.createMessage(newMessage.content, sender, chatRoom);
      //   // Enregistrement du message en base de données avec Prisma
    
      //   this.server.to(newMessage.chatRoomId.toString()).emit('newMessage', message);
      // }

}

