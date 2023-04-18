import { Controller, UseGuards } from "@nestjs/common";
import { Put } from "@nestjs/common";
import  { JwtGuard } from "../auth/guard";
import { WebsocketService } from "./websocket.service";

@UseGuards(JwtGuard)
@Controller('websocket')
export class WebsocketController {
    constructor(private websocketService: WebsocketService) {}

    // @UseGuards(JwtGuard)
    // @Put('setSocket/:id')
    // async setSocket(@Body() body: { user: User, socket: any }): Promise<User> {
    //     return this.websocketService.setSocket(body.user, body.socket);
    // }
}