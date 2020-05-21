import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { MailController } from './mail.controller';
import { MailProcessor } from './mail.processor';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailService } from './mail.service';
import { FileModule } from '@src/file/file.module';

@Module({
  imports: [
    BullModule.registerQueueAsync({
      name: 'mail',
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        redis: {
          host: configService.get('REDIS_HOST'),
          port: +configService.get('REDIS_PORT'),
        },
      }),
      inject: [ConfigService],
    }),
    FileModule
  ],
  controllers: [MailController],
  providers: [MailProcessor, MailService],
})
export class MailModule {}
