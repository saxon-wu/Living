import { Module, RequestMethod, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ArticleController } from './article.controller';
import { ArticleService } from './article.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArticleEntity } from './article.entity';
import { AdminArticleController } from './admin-article.controller';
import { AuthenticatorMiddleware } from '@src/shared/authenticator.middleware';
import { FileModule } from '@src/file/file.module';

@Module({
  imports: [TypeOrmModule.forFeature([ArticleEntity]), FileModule],
  controllers: [ArticleController, AdminArticleController],
  providers: [ArticleService],
  exports: [ArticleService],
})
export class ArticleModule  implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthenticatorMiddleware)
      .forRoutes({ path: '/v1/article/:title', method: RequestMethod.GET });
  }
}
