import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
  Delete,
  Query,
} from '@nestjs/common';
import { CommentService } from './comment.service';
import { UUIDParamDTO } from '@src/shared/shared.dto';
import { User } from '@src/shared/user.decorator';
import { CreateCommentDTO } from './comment.dto';
import { AuthGuard } from '@src/shared/auth.guard';
import { UserEntity } from '@src/user/user.entity';
import { Pagination } from 'nestjs-typeorm-paginate';
import { ICommentOutput } from './comment.interface';
import { SortEnum } from '../shared/shared.enum';
import { CommentEntity } from './comment.entity';

const MANY = 'comments';
const ONE = 'comment';

@Controller('v1')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  /**
   * @description 文章下的所有评论
   * @author Saxon
   * @date 2020-03-13
   * @param {UUIDParamDTO} articleParamDTO
   * @param {number} [page=1]
   * @param {number} [limit=10]
   * @param {SortEnum} [sort=SortEnum.DESC]
   * @returns {Promise<Pagination<ICommentOutput>>}
   * @memberof CommentController
   */
  @Get(`${MANY}/article/:id`)
  async findAll(
    @Param() articleParamDTO: UUIDParamDTO,
    @Query('current') page: number = 1,
    @Query('pageSize') limit: number = 10,
    @Query('sort') sort: SortEnum = SortEnum.DESC,
  ): Promise<Pagination<CommentEntity>> {
    // nestjs 7.0 自动转换number,bool未传时则为NaN,false
    if (isNaN(page)) page = 1;
    if (isNaN(limit)) limit = 10;
    return await this.commentService.findAll(
      articleParamDTO,
      { page, limit },
      sort,
    );
  }

  @UseGuards(AuthGuard)
  @Post(ONE)
  async create(
    @Body() createCommentDTO: CreateCommentDTO,
    @User() user: UserEntity,
  ): Promise<CommentEntity> {
    return await this.commentService.create(createCommentDTO, user);
  }

  @UseGuards(AuthGuard)
  @Post(`${ONE}/:id/like`)
  async like(
    @Param() commentParamDTO: UUIDParamDTO,
    @User() user: UserEntity,
  ): Promise<CommentEntity> {
    return await this.commentService.like(commentParamDTO, user);
  }

  @Delete(`${ONE}/:id`)
  async destroy(@Param() commentParamDTO: UUIDParamDTO) {}

  @Get(`${ONE}/:id`)
  async findOne(@Param() commentParamDto: UUIDParamDTO) {
    return await this.commentService.findOne(commentParamDto);
  }
}
