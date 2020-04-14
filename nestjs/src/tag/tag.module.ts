import { Module } from '@nestjs/common';
import { TagService } from './tag.service';
import { TagController } from './tag.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TagEntity } from './tag.entity';
import { AdminTagController } from './admin-tag.controller';

@Module({
  imports: [TypeOrmModule.forFeature([TagEntity])],
  providers: [TagService],
  controllers: [TagController, AdminTagController]
})
export class TagModule {}
