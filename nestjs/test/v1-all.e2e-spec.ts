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
  const API_VERSION = 'v1';
  const password = '123456';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleFixture.createNestApplication();
    server = app.getHttpServer();
    await app.init();
  });

  // describe('注册用户', () => {
  //   for (let i = 0; i < 10; i++) {
  //     it(`/${API_VERSION}/auth/register (POST)`, async (done) => {
  //       const response = await request(server)
  //         .post(`/${API_VERSION}/auth/register`)
  //         .send({
  //           username: faker.name.firstName(),
  //           password,
  //         })
  //         .expect(201);
  //       const register = response.body;
  //       expect(register).toMatchSnapshot({
  //         id: expect.any(String),
  //         username: expect.any(String),
  //         accessToken: expect.any(String),
  //         expiresIn: expect.any(Number),
  //       });
  //       accessToken = register.accessToken;
  //       done();
  //     });
  //   }
  // });



  describe('获取所有用户', () => {
    it(`/${API_VERSION}/users (GET)`, async (done) => {
      const response = await request(server)
        .get(`/${API_VERSION}/users`)
        .expect(200);
      const users = response.body.items;
      randomUser = users[random(users.length)];
      expect(randomUser).toHaveProperty('id');
      expect(randomUser).toHaveProperty('username');
      done();
    });
  });

  describe('随机用户登录', () => {
    it(`/${API_VERSION}/auth/login (POST)`, async (done) => {
      const response = await request(server)
        .post(`/${API_VERSION}/auth/login`)
        .send({
          username: randomUser.username,
          password,
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

  // describe('发布文章', () => {
  //   it(`/${API_VERSION}/article (POST)`, async (done) => {
  //     const title = faker.name.title();
  //     const content = {
  //       time: Date.now(),
  //       blocks: [
  //         {
  //           type: 'header',
  //           data: {
  //             text: faker.name.title(),
  //             level: Math.ceil(Math.random() * 6),
  //           },
  //         },
  //         {
  //           type: 'paragraph',
  //           data: {
  //             text: faker.lorem.paragraphs(),
  //           },
  //         },
  //       ],
  //       version: '2.17.0',
  //     };
  //     const response = await request(server)
  //       .post(`/${API_VERSION}/article`)
  //       .set('Authorization', `Bearer ${accessToken}`)
  //       .send({
  //         title,
  //         content,
  //       })
  //       .expect(201);
  //     const article = response.body;
  //     expect(article).toHaveProperty('title', title);
  //     expect(article).toHaveProperty('content', content);
  //     done();
  //   });
  // });

  describe('获取所有文章', () => {
    it(`/${API_VERSION}/article (GET)`, async (done) => {
      const response = await request(server)
        .get(`/${API_VERSION}/articles`)
        .expect(200);
      const articles = response.body.items;
      randomArticle = articles[random(articles.length)];
      expect(randomArticle).toHaveProperty('title');
      expect(randomArticle).toHaveProperty('content');
      done();
    });
  });

  describe('随机为文章点赞或取消点赞', () => {
    it(`/${API_VERSION}/article/:uuid/like (POST)`, async (done) => {
      const response = await request(server)
        .post(`/${API_VERSION}/article/${randomArticle.id}/like`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(201);
      const article = response.body;
      expect(article).toHaveProperty('title', randomArticle.title);
      expect(article).toHaveProperty('content', randomArticle.content);
      done();
    });
  });

  describe('随机收藏或取消收藏文章', () => {
    it(`/${API_VERSION}/article/:uuid/bookmark (POST)`, async (done) => {
      const response = await request(server)
        .post(`/${API_VERSION}/article/${randomArticle.id}/bookmark`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(201);
      const user = response.body;
      expect(user).toHaveProperty('username', randomUser.username);
      done();
    });
  });

  describe('随机对文章评论', () => {
    it(`/${API_VERSION}/comment (POST)`, async (done) => {
      const content = faker.lorem.lines();
      const response = await request(server)
        .post(`/${API_VERSION}/comment`)
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
    it(`/${API_VERSION}/comment/article/:uuid (GET)`, async (done) => {
      const response = await request(server)
        .get(`/${API_VERSION}/comments/article/${randomArticle.id}`)
        .expect(200);
      const comments = response.body.items;
      randomComment = comments[random(comments.length)];
      expect(randomComment).toHaveProperty('id');
      expect(randomComment).toHaveProperty('content');
      done();
    });
  });

  describe('随机对评论回复', () => {
    it(`/${API_VERSION}/reply (POST)`, async (done) => {
      const content = faker.lorem.lines();
      const response = await request(server)
        .post(`/${API_VERSION}/reply`)
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
    it(`/${API_VERSION}/comment/:uuid/like (POST)`, async (done) => {
      const content = faker.lorem.lines();
      const response = await request(server)
        .post(`/${API_VERSION}/comment/${randomComment.id}/like`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(201);
      const reply = response.body;
      expect(reply).toHaveProperty('content');
      done();
    });
  });

  describe('随机对“回复”回复', () => {
    it(`/${API_VERSION}/reply (POST)`, async (done) => {
      const randomReplyLength = randomComment.replies.length;
      if (!randomReplyLength) {
        console.error('同一评论没有可以回复的目标');
        return done();
      }
      const randomReply = randomComment.replies[random(randomReplyLength)];
      const content = faker.lorem.lines();
      const response = await request(server)
        .post(`/${API_VERSION}/reply`)
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
    it(`/${API_VERSION}/reply/:uuid/like (POST)`, async (done) => {
      const randomReplyLength = randomComment.replies.length;
      if (!randomReplyLength) {
        console.error('同一评论没有可以回复的点赞目标');
        return done();
      }
      const randomReply = randomComment.replies[random(randomReplyLength)];
      const response = await request(server)
        .post(`/${API_VERSION}/reply/${randomReply.id}/like`)
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
