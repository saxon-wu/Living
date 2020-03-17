import { Test, TestingModule } from '@nestjs/testing';
import { ReplyController } from './reply.controller';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '@src/app.module';

describe('Reply Controller', () => {
  let controller: ReplyController;
  let articleUUID: string;
  let app: INestApplication;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    controller = module.get<ReplyController>(ReplyController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
