import { Test, TestingModule } from '@nestjs/testing';
import { ArticleController } from './article.controller';
import { AppModule } from '@src/app.module';
import { INestApplication } from '@nestjs/common';
import { AuthController } from '@src/auth/auth.controller';
import * as faker from 'faker/locale/zh_CN';
import { UserController } from '@src/user/user.controller';
import { UserEntity } from '@src/user/user.entity';
import { ArticleEntity } from './article.entity';

describe('Article Controller', () => {
  let app: INestApplication;
  let randomArticleUUID: string;
  let articleController: ArticleController;
  let authController: AuthController;
  let userController: UserController;
  let login: { id: string };
  let random = (max: number): number => Math.floor(Math.random() * max);
  let userEntity: UserEntity;
  let usersEntity: UserEntity[];

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = module.createNestApplication();
    articleController = module.get<ArticleController>(ArticleController);
    authController = module.get<AuthController>(AuthController);
    userController = module.get<UserController>(UserController);

    usersEntity = await userController.findAllForTest(
      /*returnsEntity*/ true,
    );

    login = await authController.login({
      username: usersEntity[random(usersEntity.length)].username,
      password: '123456',
    });
    userEntity = await userController.findOneForTest({ uuid: login.id });
  });

  describe('findAll', () => {
    it('获取所有文章', async done => {
      expect.assertions(1);
      const articles = await articleController.findAll();
      expect(articles).toContainEqual({
        id: expect.any(String),
        title: expect.any(String),
        content: expect.any(String),
        publisher: {
          id: expect.any(String),
          username: expect.any(String),
        },
        likes: expect.any(Array),
        likesCount: expect.any(Number),
        favoriteUsers: [
          {
            id: expect.any(String),
            username: expect.any(String),
          },
        ],
        favoriteUsersCount: expect.any(Number),
      });

      randomArticleUUID = articles[random(articles.length)].id;

      done();
    });
  });

  describe('findOne', () => {
    it('随机获取1条文章', async done => {
      expect.assertions(1);
      const findOne = await articleController.findOne({
        uuid: randomArticleUUID,
      });
      expect(findOne).toMatchObject({
        id: expect.any(String),
        title: expect.any(String),
        content: expect.any(String),
        publisher: expect.any(Object),
        likes: expect.any(Array),
        likesCount: expect.any(Number),
        favoriteUsers: expect.any(Array),
        favoriteUsersCount: expect.any(Number),
      });
      done();
    });
  });

  describe('create', () => {
    it('发布文章', async done => {
      expect.assertions(2);

      const creatingArticle = await articleController.create(
        { title: faker.name.title(), content: faker.lorem.text(10) },
        userEntity,
      );

      expect(creatingArticle).toHaveProperty('title');
      expect(creatingArticle).toHaveProperty('content');
      done();
    });
  });

  describe('softRemove', () => {
    const testTitle = '软删除文章';
    it(testTitle, async done => {
      // 当前登录的用户
      const currentUser = await userController.findOne({ uuid: login.id });

      // 当前登录的用户的文章数量
      const currentUserArticleLength = currentUser.articles.length;
      if (!currentUserArticleLength) {
        console.error(`软删除失败：当前用户没有发布过文章 - ${testTitle}`);
        done();
      }

      // 当前登录的用户随机文章
      const currentUserRandomArticle =
        currentUser.articles[random(currentUserArticleLength)];
      // 当前登录的用户随机文章的uuid
      const currentUserRandomArticleUUID = currentUserRandomArticle.id;
      const softRemovingArticle = await articleController.softDelete(
        { uuid: currentUserRandomArticleUUID },
        userEntity,
      );
      expect(softRemovingArticle).toStrictEqual('删除成功');
      done();
    });
  });

  describe('softRestore', () => {
    it('TODO: 软恢复文章', async done => {
      expect.assertions(0);
      // TODO: 未获取已软删除的数据
      // softRemovingArticle = await articleController.softRestore(
      //   { uuid:  },
      //   userEntity,
      // );
      // expect(softRemovingArticle).toStrictEqual('恢复成功');
      done();
    });
  });

  describe('like', () => {
    const testTitle = '为文章点赞或取消点赞';
    it(testTitle, async done => {
      // const otherUsers = usersEntity.filter(v => v.uuid !== login.id)

      // 重新获取用户，以防文章已软删除操作报“文章不存在”的情况
      usersEntity = await userController.findAllForTest(
        /*returnsEntity*/ true,
      );

      // 指定的随机用户
      const specifieRandomdUser = usersEntity[random(usersEntity.length)];
      // 指定的随机用户的文章数量
      const specifiedUserArticlesLength = specifieRandomdUser.articles.length;
      if (!specifiedUserArticlesLength) {
        console.error(
          `点赞或取消点赞失败：指定的用户没有发布过文章 - ${testTitle}`,
        );
        done();
      }

      // 指定的随机用户的随机文章
      const specifiedRandomArticle: ArticleEntity =
        specifieRandomdUser.articles[random(specifiedUserArticlesLength)];
      // 指定的随机用户的随机文章的uuid
      const specifiedRandomArticleUUID = specifiedRandomArticle.uuid;

      const likeArticle = await articleController.like(
        { uuid: specifiedRandomArticleUUID },
        userEntity,
      );

      expect(likeArticle).toHaveProperty(
        'content',
        specifiedRandomArticle.content,
      );
      done();
    });
  });

  describe('favorites', () => {
    const testTitle = '收藏取消收藏文章';
    it(testTitle, async done => {
      // const otherUsers = usersEntity.filter(v => v.uuid !== login.id)

      // 重新获取用户，以防文章已软删除操作报“文章不存在”的情况
      usersEntity = await userController.findAllForTest(
        /*returnsEntity*/ true,
      );

      // 指定的随机用户
      const specifieRandomdUser = usersEntity[random(usersEntity.length)];
      // 指定的随机用户的文章数量
      const specifiedUserArticlesLength = specifieRandomdUser.articles.length;
      if (!specifiedUserArticlesLength) {
        console.error(
          `收藏取消收藏文章失败：指定的用户没有发布过文章 - ${testTitle}`,
        );
        done();
      }

      // 指定的随机用户的随机文章
      const specifiedRandomArticle: ArticleEntity =
        specifieRandomdUser.articles[random(specifiedUserArticlesLength)];

      // 指定的随机用户的随机文章的uuid
      const specifiedRandomArticleUUID = specifiedRandomArticle.uuid;

      const favoriteArticle = await articleController.favorites(
        { uuid: specifiedRandomArticleUUID },
        userEntity,
      );
      // 取消操作还是收藏操作
      const IsSpecifiedRandomArticleInfavorite = favoriteArticle.favorites.find(
        v => v.id === specifiedRandomArticle.uuid,
      );
      if (IsSpecifiedRandomArticleInfavorite?.id) {
        //收藏操作
        expect(IsSpecifiedRandomArticleInfavorite).toHaveProperty(
          'content',
          specifiedRandomArticle.content,
        );
      }
      expect(favoriteArticle).toHaveProperty('username');

      done();
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
