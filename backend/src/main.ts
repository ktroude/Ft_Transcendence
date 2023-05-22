/* eslint-disable prettier/prettier */
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { config } from 'dotenv';
import { AppModule } from './app.module';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import { Server } from 'colyseus';
import { publicRoom } from './rooms/publicRoom';
import { gameRoomService } from './game/rooms/gameRoom';
import { RankedLobbyRoom } from './game/matchmaking/matchmaking';
import { async } from 'rxjs';

const cookieSession = require('cookie-session'); // cette nomenclature et la meme que celle en commit au dessus, sauf que celle du dessus marche pas, jsp pourquoi.
async function ServerGame() {
  const gameServer = new Server();
  gameServer.listen(3001);
  // gameServer.listen(3002);
  // gameServer.define('public_room', publicRoom)
  // .filterBy(['maxClients'])
  gameServer.define('ranked', RankedLobbyRoom);
  gameServer.define('Private_Room', gameRoomService);
  // .filterBy(['maxClients'])

}


async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  app.use(cookieParser());
  app.use(cookieSession({ secret: process.env.COOKIE_SECRET }));
  config();
  app.use(
    cors({
      origin: '*',
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
      credentials: true,
    }),
  );
  app.use(bodyParser.json({ limit: '50mb' }));
  app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
  await app.listen(3000);
}
ServerGame();
bootstrap();
