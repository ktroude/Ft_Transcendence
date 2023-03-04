import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing'
import { PrismaService } from '../src/prisma/prisma.service';
import { AppModule } from '../src/app.module';
import * as pactum from 'pactum';
import { AuthDto } from 'src/auth/dto';
import { CreateBookmarkDto, EditBookmarkDto } from 'src/bookmark/dto';
import { BookmarkService } from 'src/bookmark/bookmark.service';
import { BookmarkController } from 'src/bookmark/bookmark.controller';

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
    // describe('Edit user', () => {});
  });

  describe('Bookmarks', () => {
    describe('Get empty bookmarks', () => {
      it('should get bookmarks', () => {
        return pactum
          .spec()
          .get('/bookmarks')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(200)
          .expectBody([]);
      });
    });

    describe('Create bookmark', () => {
      const dto: CreateBookmarkDto = {
        title: 'First Bookmark',
        link: 'https://www.youtube.com/watch?v=d6WC5n9G_sM',
      };
      it('should create bookmark', () => {
        return pactum
          .spec()
          .post('/bookmarks')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .withBody(dto)
          .expectStatus(201)
          .stores('bookmarkId', 'id');
      });
    });

    describe('Get bookmarks', () => {
      it('should get bookmarks', () => {
        return pactum
          .spec()
          .get('/bookmarks')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(200)
          .expectJsonLength(1);
      });
    });

    describe('Get bookmark by id', () => {
      it('should get bookmark by id', () => {
        return pactum
          .spec()
          .get('/bookmarks/{id}')
          .withPathParams('id', '$S{bookmarkId}')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(200)
          .expectBodyContains('$S{bookmarkId}');
      });
    });

    describe('Edit bookmark by id', () => {
      const dto: EditBookmarkDto = {
        title:
          'Kubernetes Course - Full Beginners Tutorial (Containerize Your Apps!)',
        description:
          'Learn how to use Kubernetes in this complete course. Kubernetes makes it possible to containerize applications and simplifies app deployment to production.',
      };
      it('should edit bookmark', () => {
        return pactum
          .spec()
          .patch('/bookmarks/{id}')
          .withPathParams('id', '$S{bookmarkId}')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .withBody(dto)
          .expectStatus(200)
          .expectBodyContains(dto.title)
          .expectBodyContains(dto.description);
      });
    });

    describe('Delete bookmark by id', () => {
      it('should delete bookmark', () => {
        return pactum
          .spec()
          .delete('/bookmarks/{id}')
          .withPathParams('id', '$S{bookmarkId}')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(204);
      });

      it('should get empty bookmarks', () => {
        return pactum
          .spec()
          .get('/bookmarks')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(200)
          .expectJsonLength(0);
      });
    });
  });
});