import { Test, TestingModule } from '@nestjs/testing';
import { CommentController } from './comment.controller';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '@src/app.module';

describe('Comment Controller', () => {
  let controller: CommentController;
  let articleUUID: string;
  let app: INestApplication;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = module.createNestApplication();
    controller = module.get<CommentController>(CommentController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
