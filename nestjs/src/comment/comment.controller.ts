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
   * @returns {Promise<Pagination<ICommentOutput>>}
   * @memberof CommentController
   */
  @Get(`${MANY}/article/:uuid`)
  async findAll(
    @Param() articleParamDTO: UUIDParamDTO,
    @Query('current') page: number = 1,
    @Query('pageSize') limit: number = 10,
  ): Promise<Pagination<ICommentOutput>> {
    // nestjs 7.0 自动转换number,bool未传时则为NaN,false
    if (isNaN(page)) page = 1;
    if (isNaN(limit)) limit = 10;
    return await this.commentService.findAll(articleParamDTO, { page, limit });
  }

  @UseGuards(AuthGuard)
  @Post(ONE)
  async create(
    @Body() createOrRelyComment: CreateCommentDTO,
    @User() user: UserEntity,
  ): Promise<ICommentOutput> {
    return await this.commentService.create(createOrRelyComment, user);
  }

  @UseGuards(AuthGuard)
  @Post(`${ONE}/:uuid/like`)
  async like(
    @Param() commentParamDTO: UUIDParamDTO,
    @User() user: UserEntity,
  ): Promise<ICommentOutput> {
    return await this.commentService.like(commentParamDTO, user);
  }

  @Delete(`${ONE}/:uuid`)
  async destroy(@Param() commentParamDTO: UUIDParamDTO) {}

  @Get(`${ONE}/:uuid`)
  async findOne(@Param() commentParamDto: UUIDParamDTO) {
    return await this.commentService.findOne(commentParamDto);
  }
}
