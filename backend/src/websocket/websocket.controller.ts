import { Controller, UseGuards } from "@nestjs/common";
import { Put , Get, Param} from "@nestjs/common";
import  { JwtGuard } from "../auth/guard";
import { WebsocketService } from "./websocket.service";
import { WebsocketGateway } from "./websocket.gateway";

@UseGuards(JwtGuard)
@Controller('websocket')
export class WebsocketController {
    constructor(private websocketService: WebsocketService, private websocketGateway: WebsocketGateway) {}

    // @UseGuards(JwtGuard)
    // @Put('setSocket/:id')
    // async setSocket(@Body() body: { user: User, socket: any }): Promise<User> {
    //     return this.websocketService.setSocket(body.user, body.socket);
    // }
	@UseGuards(JwtGuard)
	@Get('getClient')
	async get()
	{
		return this.websocketGateway.getClient();
	}
}