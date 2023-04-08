import { OnGatewayInit, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { OnGatewayConnection, OnGatewayDisconnect } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";

@WebSocketGateway({
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  },
})
export class ChatRoomGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  afterInit(server: any){
    console.log("Init done");
    
  }

  handleConnection(client : Socket) {
      console.log(client.handshake.headers.cookie);
    console.log('Client connected with IP:', client.id);
      
  }

  handleDisconnect(client: Socket) {
    console.log('Client disconnected with IP:', client.id);
  }

}
