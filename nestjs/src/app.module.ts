import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ArticleModule } from './article/article.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { CommentModule } from './comment/comment.module';
import { ReplyModule } from './reply/reply.module';
import { TagModule } from './tag/tag.module';
import { FileModule } from './file/file.module';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: configService.get<any>('TYPEORM_CONNECTION'),
        host: configService.get('TYPEORM_HOST'),
        port: Number.parseInt(configService.get('TYPEORM_PORT'), 10),
        username: configService.get('TYPEORM_USERNAME'),
        password: configService.get('TYPEORM_PASSWORD'),
        database: configService.get<string>('TYPEORM_DATABASE'),
        entities: configService
          .get('TYPEORM_ENTITIES')
          .split(',')
          .map((v: string) => __dirname + v),
        synchronize:
          configService.get('NODE_ENV') === 'development' &&
          configService.get('TYPEORM_SYNCHRONIZE') === 'true',
        logging: configService.get('TYPEORM_LOGGING') === 'true',
      }),
    }),
    ConfigModule.forRoot({
      envFilePath: `.development.env`,
      isGlobal: true,
    }),
    ArticleModule,
    UserModule,
    AuthModule,
    CommentModule,
    ReplyModule,
    TagModule,
    FileModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
