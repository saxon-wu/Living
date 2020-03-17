import { Test, TestingModule } from '@nestjs/testing';
import { ReplyService } from './reply.service';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '@src/app.module';

describe('ReplyService', () => {
  let service: ReplyService;
  let articleUUID: string;
  let app: INestApplication;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    service = module.get<ReplyService>(ReplyService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
