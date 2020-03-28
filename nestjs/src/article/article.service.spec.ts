import { Test, TestingModule } from '@nestjs/testing';
import { ArticleService } from './article.service';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '@src/app.module';

describe('ArticleService', () => {
  let service: ArticleService;
  let articleUUID: string;
  let app: INestApplication;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    service = module.get<ArticleService>(ArticleService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
