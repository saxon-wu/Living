import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
  Patch,
} from '@nestjs/common';
import { ArticleService } from './article.service';
import { CreateArticleDTO } from './article.dto';
import { ParamDTO } from '@src/shared/shared.dto';
import { AuthGuard } from '@src/shared/auth.guard';
import { User } from '@src/shared/user.decorator';
import { UserEntity } from '@src/user/user.entity';

@Controller('article')
export class ArticleController {
  constructor(private readonly articleService: ArticleService) {}

  @Get()
  async findAll() {
    return await this.articleService.findAll();
  }

  @Get(':uuid')
  async findOne(@Param() paramDTO: ParamDTO) {
    return await this.articleService.findOne(paramDTO);
  }

  @UseGuards(AuthGuard)
  @Post()
  async create(@Body() articleDTO: CreateArticleDTO, @User() user: UserEntity) {
    return await this.articleService.create(articleDTO, user);
  }

  @UseGuards(AuthGuard)
  @Put(':uuid')
  async update(
    @Param() articleParamDTO: ParamDTO,
    @Body() articleDTO: CreateArticleDTO,
    @User() user: UserEntity,
  ) {
    return await this.articleService.update(articleParamDTO, articleDTO, user);
  }

  @UseGuards(AuthGuard)
  @Delete(':uuid')
  async softDelete(
    @Param() articleParamDTO: ParamDTO,
    @User() user: UserEntity,
  ) {
    return await this.articleService.softDelete(articleParamDTO, user);
  }

  @UseGuards(AuthGuard)
  @Patch(':uuid')
  async softRestore(@Param() articleParamDTO: ParamDTO, user: UserEntity) {
    return await this.articleService.softRestore(articleParamDTO, user);
  }

  @UseGuards(AuthGuard)
  @Post(':uuid/like')
  async like(@Param() articleParamDTO: ParamDTO, @User() user: UserEntity) {
    return await this.articleService.like(articleParamDTO, user);
  }

  @UseGuards(AuthGuard)
  @Post(':uuid/bookmark')
  async bookmark(@Param() articleParamDTO: ParamDTO, @User() user: UserEntity) {
    return await this.articleService.bookmark(articleParamDTO, user);
  }
}
