import { TestingModule, Test } from '@nestjs/testing';
import { AppModule } from '@src/app.module';
import { INestApplication } from '@nestjs/common';
import { Server } from 'http';
import * as request from 'supertest';
import * as faker from 'faker';

describe('测试完整流程', () => {
  let app: INestApplication;
  let server: Server;
  const random = (max: number): number => Math.floor(Math.random() * max);
  let randomUser;
  let accessToken: string;
  let randomArticle;
  let randomComment;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleFixture.createNestApplication();
    server = app.getHttpServer();
    await app.init();
  });

  describe('获取所有用户', () => {
    it('/user (GET)', async done => {
      const response = await request(server)
        .get('/user')
        .expect(200);
      const users = response.body;
      randomUser = users[random(users.length)];
      expect(randomUser).toHaveProperty('id');
      expect(randomUser).toHaveProperty('username');
      done();
    });
  });

  describe('随机用户登录', () => {
    it('/auth/login (POST)', async done => {
      const response = await request(server)
        .post('/auth/login')
        .send({
          username: randomUser.username,
          password: '123456',
        })
        .expect(201);
      const login = response.body;
      expect(login).toMatchSnapshot({
        id: expect.any(String),
        username: expect.any(String),
        accessToken: expect.any(String),
        expiresIn: expect.any(Number),
      });
      accessToken = login.accessToken;
      done();
    });
  });

  describe('发布文章', () => {
    it('/article (POST)', async done => {
      const title = faker.name.title();
      const content = faker.lorem.paragraphs();
      const response = await request(server)
        .post('/article')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ title, content })
        .expect(201);
      const article = response.body;
      expect(article).toHaveProperty('title', title);
      expect(article).toHaveProperty('content', content);
      done();
    });
  });

  describe('获取所有文章', () => {
    it('/article (GET)', async done => {
      const response = await request(server)
        .get('/article')
        .expect(200);
      const articles = response.body;
      randomArticle = articles[random(articles.length)];
      expect(randomArticle).toHaveProperty('title');
      expect(randomArticle).toHaveProperty('content');
      done();
    });
  });

  describe('随机为文章点赞或取消点赞', () => {
    it('/article/:uuid/like (POST)', async done => {
      const response = await request(server)
        .post(`/article/${randomArticle.id}/like`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(201);
      const article = response.body;
      expect(article).toHaveProperty('title', randomArticle.title);
      expect(article).toHaveProperty('content', randomArticle.content);
      done();
    });
  });

  describe('随机收藏或取消收藏文章', () => {
    it('/article/:uuid/bookmark (POST)', async done => {
      const response = await request(server)
        .post(`/article/${randomArticle.id}/bookmark`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(201);
      const user = response.body;
      expect(user).toHaveProperty('username', randomUser.username);
      done();
    });
  });

  describe('随机对文章评论', () => {
    it('/comment (POST)', async done => {
      const content = faker.lorem.lines();
      const response = await request(server)
        .post(`/comment`)
        .send({ content, articleId: randomArticle.id })
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(201);
      const comment = response.body;
      expect(comment).toHaveProperty('content', content);
      expect(comment).toHaveProperty('commenter.username', randomUser.username);
      done();
    });
  });

  describe('获取所有评论', () => {
    it('/comment/article/:uuid (GET)', async done => {
      const response = await request(server)
        .get(`/comment/article/${randomArticle.id}`)
        .expect(200);
      const comment = response.body;
      randomComment = comment[random(comment.length)];
      expect(randomComment).toHaveProperty('id');
      expect(randomComment).toHaveProperty('content');
      done();
    });
  });

  describe('随机对评论回复', () => {
    it('/reply (POST)', async done => {
      const content = faker.lorem.lines();
      const response = await request(server)
        .post(`/reply`)
        .send({ content, commentId: randomComment.id })
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(201);
      const reply = response.body;
      expect(reply).toHaveProperty('content', content);
      expect(reply).toHaveProperty('replier.username', randomUser.username);
      done();
    });
  });

  describe('随机对评论点赞', () => {
    it('/comment/:uuid/like (POST)', async done => {
      const content = faker.lorem.lines();
      const response = await request(server)
        .post(`/comment/${randomComment.id}/like`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(201);
      const reply = response.body;
      expect(reply).toHaveProperty('content');
      done();
    });
  });

  describe('随机对“回复”回复', () => {
    it('/reply (POST)', async done => {
      const randomReplyLength = randomComment.replies.length;
      if (!randomReplyLength) {
        console.error('同一评论没有可以回复的目标');
        return done();
      }
      const randomReply = randomComment.replies[random(randomReplyLength)];
      const content = faker.lorem.lines();
      const response = await request(server)
        .post(`/reply`)
        .send({
          content,
          commentId: randomComment.id,
          replyParentId: randomReply.id,
        })
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(201);
      const reply = response.body;
      expect(reply).toHaveProperty('content', content);
      expect(reply).toHaveProperty('replier.username', randomUser.username);
      done();
    });
  });

  describe('随机对“回复”点赞', () => {
    it('/reply/:uuid/like (POST)', async done => {
      const randomReplyLength = randomComment.replies.length;
      if (!randomReplyLength) {
        console.error('同一评论没有可以回复的点赞目标');
        return done();
      }
      const randomReply = randomComment.replies[random(randomReplyLength)];
      const response = await request(server)
        .post(`/reply/${randomReply.id}/like`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(201);
      const reply = response.body;
      expect(reply).toHaveProperty('content');
      done();
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
