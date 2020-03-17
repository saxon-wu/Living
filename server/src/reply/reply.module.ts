import { Module } from '@nestjs/common';
import { ReplyController } from './reply.controller';
import { ReplyService } from './reply.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReplyEntity } from './reply.entity';
import { CommentModule } from '@src/comment/comment.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ReplyEntity]),
    CommentModule,
  ],
  controllers: [ReplyController],
  providers: [ReplyService],
})
export class ReplyModule {}
