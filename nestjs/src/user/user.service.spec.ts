import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '@src/app.module';

describe('UserService', () => {
  let service: UserService;
  let articleUUID: string;
  let app: INestApplication;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
