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

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: config.get<any>('TYPEORM_CONNECTION'),
        host: config.get('TYPEORM_HOST'),
        port: Number.parseInt(config.get('TYPEORM_PORT'), 10),
        username: config.get('TYPEORM_USERNAME'),
        password: config.get('TYPEORM_PASSWORD'),
        database: config.get<string>('TYPEORM_DATABASE'),
        entities: config.get('TYPEORM_ENTITIES').split(',').map((v: string) => __dirname + v),
        synchronize: config.get('NODE_ENV') && config.get('TYPEORM_SYNCHRONIZE') === 'true',
        logging: config.get('TYPEORM_LOGGING') === 'true'
      })
    }),
    ConfigModule.forRoot({
      envFilePath: `.development.env`,
      isGlobal: true
    }),
    ArticleModule,
    UserModule,
    AuthModule,
    CommentModule,
    ReplyModule,
    TagModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
