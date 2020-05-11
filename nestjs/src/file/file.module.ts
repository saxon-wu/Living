import { Module } from '@nestjs/common';
import { FileService } from './file.service';
import { FileController } from './file.controller';
import { MulterModule } from '@nestjs/platform-express';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FileEntity } from './file.entity';
import { AdminFileController } from './admin-file.controller';
import { MulterConfigService } from '@src/shared/multer-config.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([FileEntity]),
    MulterModule.registerAsync({
      useClass: MulterConfigService,
    }),
  ],
  providers: [FileService, MulterConfigService],
  controllers: [FileController, AdminFileController],
  exports: [FileService]
})

export class FileModule {}
