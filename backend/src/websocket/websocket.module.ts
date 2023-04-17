import { Module } from "@nestjs/common";
import { WebsocketController } from "./websocket.controller";
import { WebsocketGateway } from "./websocket.gateway";
import { WebsocketService } from "./websocket.service";

@Module({
    imports: [],
    controllers: [WebsocketController],
    providers: [WebsocketService, WebsocketGateway],
})
export class WebsocketModule {}