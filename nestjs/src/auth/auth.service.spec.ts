import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '@src/app.module';

describe('AuthService', () => {
  let service: AuthService;
  let articleUUID: string;
  let app: INestApplication;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
