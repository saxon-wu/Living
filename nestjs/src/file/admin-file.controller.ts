import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFiles,
  UseGuards,
  Get,
  Query,
  Param,
} from '@nestjs/common';
import { AnyFilesInterceptor, FileInterceptor } from '@nestjs/platform-express';
import { FileService } from './file.service';
import { AuthGuard } from '@src/shared/auth.guard';
import { User } from '@src/shared/user.decorator';
import { UserEntity } from '@src/user/user.entity';
import { Pagination } from 'nestjs-typeorm-paginate';
import { IFileOutput } from './file.interface';
import { UUIDParamDTO } from '@src/shared/shared.dto';
import { FileEntity } from './file.entity';

const MANY = 'files';
const ONE = 'file';

@UseGuards(AuthGuard)
@Controller('v1/admin')
export class AdminFileController {
  constructor(private readonly fileService: FileService) {}

  @Get(MANY)
  async findAll(
    @Query('current') page: number = 1,
    @Query('pageSize') limit: number = 10,
    @User() user: UserEntity,
  ): Promise<Pagination<FileEntity>> {
    // nestjs 7.0 自动转换number,bool未传时则为NaN,false
    if (isNaN(page)) page = 1;
    if (isNaN(limit)) limit = 10;
    return await this.fileService.findAll(
      { page, limit },
      /* isAdminSide */ true,
      user,
    );
  }
}
