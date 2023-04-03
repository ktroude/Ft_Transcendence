import { WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server } from "socket.io";

@WebSocketGateway({
    cors: {
        origin: "*"
    }
})
export class MessageGateway {
    @WebSocketServer()
 
    server:Server;
}