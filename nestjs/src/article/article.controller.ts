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
  Query,
} from '@nestjs/common';
import { ArticleService } from './article.service';
import { CreateArticleDTO, UpdateArticleDTO } from './article.dto';
import { UUIDParamDTO, TitleParamDTO } from '@src/shared/shared.dto';
import { AuthGuard } from '@src/shared/auth.guard';
import { User } from '@src/shared/user.decorator';
import { UserEntity } from '@src/user/user.entity';
import { Pagination } from 'nestjs-typeorm-paginate';
import { IArticleOutput } from './article.interface';
import { IUserOutput } from '@src/user/user.interface';
import { ArticleEntity } from './article.entity';

const MANY = 'articles';
const ONE = 'article';

@Controller('v1')
export class ArticleController {
  constructor(private readonly articleService: ArticleService) {}

  @Get(MANY)
  async findAll(
    @Query('current') page: number = 1,
    @Query('pageSize') limit: number = 10,
  ): Promise<Pagination<ArticleEntity>> {
    // nestjs 7.0 自动转换number,bool未传时则为NaN,false
    if (isNaN(page)) page = 1;
    if (isNaN(limit)) limit = 10;
    return await this.articleService.findAll({ page, limit });
  }

  @Get(`${ONE}/:id`)
  async findOne(
    @Param() paramDTO: UUIDParamDTO,
    @User() user: UserEntity | undefined,
  ): Promise<ArticleEntity> {
    // user 的作用是 无需守卫时提供用户信息，以方便判定所有者
    return <ArticleEntity>(
      await this.articleService.findOne(paramDTO, user || null)
    );
  }

  @UseGuards(AuthGuard)
  @Post(ONE)
  async create(
    @Body() articleDTO: CreateArticleDTO,
    @User() user: UserEntity,
  ): Promise<ArticleEntity> {
    return await this.articleService.create(articleDTO, user);
  }

  @UseGuards(AuthGuard)
  @Put(`${ONE}/:id`)
  async update(
    @Param() articleParamDTO: UUIDParamDTO,
    @Body() articleDTO: UpdateArticleDTO,
    @User() user: UserEntity,
  ): Promise<ArticleEntity | string> {
    return await this.articleService.update(articleParamDTO, articleDTO, user);
  }

  @UseGuards(AuthGuard)
  @Delete(`${ONE}/:id`)
  async softDelete(
    @Param() articleParamDTO: UUIDParamDTO,
    @User() user: UserEntity,
  ): Promise<string> {
    return await this.articleService.softDelete(articleParamDTO, user);
  }

  @UseGuards(AuthGuard)
  @Patch(`${ONE}/:id`)
  async softRestore(
    @Param() articleParamDTO: UUIDParamDTO,
    user: UserEntity,
  ): Promise<string> {
    return await this.articleService.softRestore(articleParamDTO, user);
  }

  @UseGuards(AuthGuard)
  @Post(`${ONE}/:id/like`)
  async like(
    @Param() articleParamDTO: UUIDParamDTO,
    @User() user: UserEntity,
  ): Promise<ArticleEntity> {
    return await this.articleService.like(articleParamDTO, user);
  }

  @UseGuards(AuthGuard)
  @Post(`${ONE}/:id/favorite`)
  async favorites(
    @Param() articleParamDTO: UUIDParamDTO,
    @User() user: UserEntity,
  ): Promise<UserEntity> {
    return await this.articleService.favorites(articleParamDTO, user);
  }
}
