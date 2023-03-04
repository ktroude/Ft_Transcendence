import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing'
import { PrismaService } from '../src/prisma/prisma.service';
import { AppModule } from '../src/app.module';
import * as pactum from 'pactum';
import { AuthDto } from 'src/auth/dto';

describe('App test', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule]}).compile();
    app = moduleRef.createNestApplication();
    app.useGlobalPipes( new ValidationPipe({ whitelist: true }));
    await app.init();
    await app.listen(3334);
    prisma = app.get(PrismaService);
    await prisma.cleanDb();
    pactum.request.setBaseUrl('http://localhost:3334')
  });
  
  afterAll(() => { app.close() });
  
  describe('Auth', () => {
    const dto: AuthDto = {email: 'salut@gmail.com', password: "tres secure" }
    
    describe('Signup', () => {
      // try errors
      it('Should throw error if email empty', () => {
        return pactum.spec().post('/auth/signup').withBody(dto.password).expectStatus(400).inspect();
      });
      it('Should throw error if PW empty', () => {
        return pactum.spec().post('/auth/signup').withBody(dto.email).expectStatus(400).inspect();
      })
      // try errorless request
      it('signed up', () => {
        return pactum.spec().post('/auth/signup').withBody(dto).expectStatus(201).inspect();
      })
    });
    
    describe('Signin', () => {
      it('Should throw error if email empty', () => {
        return pactum.spec().post('/auth/signup').withBody(dto.password).expectStatus(400).inspect();
      });
      it('Should throw error if PW empty', () => {
        return pactum.spec().post('/auth/signup').withBody(dto.email).expectStatus(400).inspect();
      })
      it('signed in', () => {
        return pactum.spec().post('/auth/signin').withBody(dto).expectStatus(200).inspect().stores('userAt', 'access_token');
      })
    });
  });

  describe('User', () => {
    describe('Get me', () => {
      it('should return current user', () => {
        return pactum.spec().get('/users/me').withHeaders({ Authorization: 'Bearer $S{userAt}'}).expectStatus(200).inspect();
      })
    });
    describe('Edit user', () => {});
  });

  describe('Bookmarks', () => {
    describe('Create bookmarks', () => {});
    describe('Get bookmarks', () => {});
    describe('Get bookmarks by id', () => {});
    describe('Delete bookmarks', () => {});
  });
});