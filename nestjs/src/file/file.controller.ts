import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFiles,
  UseGuards,
  Get,
  Query,
  Param,
  UploadedFile,
  Res,
  Body,
} from '@nestjs/common';
import {
  AnyFilesInterceptor,
  FileInterceptor,
  FilesInterceptor,
  FileFieldsInterceptor,
} from '@nestjs/platform-express';
import { FileService } from './file.service';
import { AuthGuard } from '@src/shared/auth.guard';
import { User } from '@src/shared/user.decorator';
import { UserEntity } from '@src/user/user.entity';
import { Pagination } from 'nestjs-typeorm-paginate';
import { IFileOutput } from './file.interface';
import { Response } from 'express';
import { CreateFileDTO } from './file.dto';
import { FileEntity } from './file.entity';

const MANY = 'files';
const ONE = 'file';

@Controller('v1')
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @UseGuards(AuthGuard)
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
      /* isAdminSide */ false,
      user,
    );
  }

  @UseGuards(AuthGuard)
  @Post(`${ONE}/uploadByFile`)
  @UseInterceptors(FileInterceptor('image'))
  async uploadByFile(
    @UploadedFile() file: any,
    @Body() fileDTO: CreateFileDTO,
    @User() user: UserEntity,
  ) {
    return this.fileService.createSingleByFile(file, fileDTO, user);
  }

  @UseGuards(AuthGuard)
  @Post(`${ONE}/uploadByUrl`)
  async uploadByUrl(@Body() fileDTO: CreateFileDTO, @User() user: UserEntity) {
    return this.fileService.createSingleByUrl(fileDTO, user);
  }

  @UseGuards(AuthGuard)
  @Post(MANY)
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'avatar', maxCount: 1 },
        { name: 'background', maxCount: 1 },
      ],
      {
        limits: {
          fileSize: 1024, // 1024byte(1k)
        },
      },
    ),
  )
  async uploadforFiles(@UploadedFiles() files, @User() user: UserEntity) {
    return this.fileService.createMultiple(files, user);
  }

  /**
   * @description 动态生成图片
   * @author Saxon
   * @date 2020-05-01
   * @param {string} slug
   * @param {Response} res
   * @param {string} format /format/<format> e.g. format=webp
   * @param {string} both /both/<w>x<h> e.g. both=100x100
   * @param {string} gaussblur /gaussblur/<radius>x<sigma> e.g. gaussblur=5
   * @memberof FileController
   */
  @Get(`${ONE}/image/:slug`)
  async findOneImage(
    @Param('slug') slug: string,
    @Res() res: Response,
    @Query('format') format: string,
    @Query('both') both: string,
    @Query('gaussblur') gaussblur: string,
  ) {
    // 避免值出现undefined，方便service中querystring.stringify()使用
    const options = {};
    format && (options['format'] = format);
    both && (options['both'] = both);
    gaussblur && (options['gaussblur'] = gaussblur);

    await this.fileService.renderImage(slug, res, options);
  }
}
