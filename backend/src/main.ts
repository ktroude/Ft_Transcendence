import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { config } from 'dotenv';
import { AppModule } from './app.module';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';

// import * as cookieSession from 'cookie-session';
const cookieSession = require('cookie-session'); // cette nomenclature et la meme que celle en commit au dessus, sauf que celle du dessus marche pas, jsp pourquoi.

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  app.use(cookieParser());
  app.use(cookieSession({ secret: process.env.COOKIE_SECRET }));
  config();
  app.use(cors())
  app.use(bodyParser.json({ limit: '50mb' }));
  app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
  await app.listen(3000);
}
bootstrap();
