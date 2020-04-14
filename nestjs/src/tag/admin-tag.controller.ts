import {
  Controller,
  Get,
  Param,
  Query,
  Post,
  Body,
  UseGuards,
  Put,
  Delete,
  flatten,
} from '@nestjs/common';
import { TagService } from './tag.service';
import { UUIDParamDTO, IdParamDTO } from '@src/shared/shared.dto';
import { CreateTagDTO, UpdateTagDTO } from './tag.dto';
import { User } from '@src/shared/user.decorator';
import { UserEntity } from '@src/user/user.entity';
import { AuthGuard } from '@src/shared/auth.guard';
import { ITagOutput } from './tag.interface';
import {
  paginate,
  Pagination,
  IPaginationOptions,
} from 'nestjs-typeorm-paginate';

const MANY = 'tags';
const ONE = 'tag';

@UseGuards(AuthGuard)
@Controller('v1/admin')
export class AdminTagController {
  constructor(private readonly tagService: TagService) {}

  @Get(`${MANY}`)
  async findAll(
    @Query('current') page: number = 1,
    @Query('pageSize') limit: number = 10,
  ) {
    // nestjs 7.0 自动转换number,bool未传时则为NaN,false
    if (isNaN(page)) page = 1;
    if (isNaN(limit)) limit = 10;
    return await this.tagService.findAllForAdmin(
      { page, limit },
      /* isAdminSide */ true,
    );
  }

  @Post(`${ONE}`)
  async create(
    @Body() tagDTO: CreateTagDTO,
    @User() user: UserEntity,
  ): Promise<ITagOutput> {
    return await this.tagService.create(tagDTO, user);
  }

  @Put(`${ONE}/:id`)
  async update(
    @Param() paramDTO: IdParamDTO,
    @Body() tagDTO: UpdateTagDTO,
    @User() user: UserEntity,
  ): Promise<ITagOutput | string> {
    return await this.tagService.updateForAdmin(paramDTO, tagDTO, user);
  }

  @Delete(`${ONE}/destruct`)
  async destroy( @Query('ids') ids: number[]): Promise<string> {
    /* ids 是string 或 array, 用flatten()处理为数组 */
    return await this.tagService.destroy(flatten([ids]));
  }
}
