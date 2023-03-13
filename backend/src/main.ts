import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { config } from 'dotenv';
import { AppModule } from './app.module';
// import * as cookieSession from 'cookie-session';
const cookieSession = require('cookie-session'); // cette nomenclature et la meme que celle en commit au dessus, sauf que celle du dessus marche pas, jsp pourquoi.

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({whitelist: true}));
  app.use(cookieSession({ secret:  process.env.COOKIE_SECRET}));
  config();
  await app.listen(3000);
}
bootstrap();
