import { Test, TestingModule } from '@nestjs/testing';
import { CommentService } from './comment.service';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '@src/app.module';

describe('CommentService', () => {
  let service: CommentService;
  let articleUUID: string;
  let app: INestApplication;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    service = module.get<CommentService>(CommentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
