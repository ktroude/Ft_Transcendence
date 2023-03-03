import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing'
import { PrismaService } from '../src/prisma/prisma.service';
import { AppModule } from '../src/app.module';
import * as pactum from 'pactum'
import { AuthDto } from 'src/auth/dto';

describe('App test', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule]}).compile();
    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
      }));
      await app.init();
      await app.listen(3333);
      prisma = app.get(PrismaService);
      await prisma.cleanDb();
  });
  
  afterAll(() => { app.close() });
  
  describe('Auth', () => {
    describe('Signup', () => {
      it('signed up', () => {
        const dto: AuthDto = {email: 'salut@gmail.com', password: "tres secure" }
        return pactum.spec().post('http://localhost:3333/auth/signup').withBody(dto).expectStatus(201).inspect();
      })
    });
    describe('Signin', () => {});
  });

  describe('User', () => {
    describe('Get me', () => {});
    describe('Edit user', () => {});
  });

  describe('Bookmarks', () => {
    describe('Create bookmarks', () => {});
    describe('Get bookmarks', () => {});
    describe('Get bookmarks by id', () => {});
    describe('Delete bookmarks', () => {});
  });
});