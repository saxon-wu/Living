import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
  Delete,
} from '@nestjs/common';
import { CommentService } from './comment.service';
import { ParamDTO } from '@src/shared/shared.dto';
import { User } from '@src/shared/user.decorator';
import { CreateCommentDTO } from './comment.dto';
import { AuthGuard } from '@src/shared/auth.guard';
import { UserEntity } from '@src/user/user.entity';

@Controller('comment')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  /**
   * @description 文章下的所有评论
   * @author Saxon
   * @date 2020-03-13
   * @param {ParamDTO} articleParamDTO
   * @returns
   * @memberof CommentController
   */
  @Get('article/:uuid')
  async findAll(@Param() articleParamDTO: ParamDTO) {
    return await this.commentService.findAll(articleParamDTO);
  }

  @UseGuards(AuthGuard)
  @Post()
  async create(
    @Body() createOrRelyComment: CreateCommentDTO,
    @User() user: UserEntity,
  ) {
    return await this.commentService.create(createOrRelyComment, user);
  }

  @UseGuards(AuthGuard)
  @Post(':uuid/like')
  async like(@Param() commentParamDTO: ParamDTO, @User() user: UserEntity) {
    return await this.commentService.like(commentParamDTO, user);
  }

  @Delete(':uuid')
  async destroy(@Param() commentParamDTO: ParamDTO) {}

  @Get(':uuid')
  async findOne(@Param() commentParamDto: ParamDTO) {
    return await this.commentService.findOne(commentParamDto);
  }
}