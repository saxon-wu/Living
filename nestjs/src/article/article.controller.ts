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
import { CreateArticleDTO } from './article.dto';
import { UUIDParamDTO } from '@src/shared/shared.dto';
import { AuthGuard } from '@src/shared/auth.guard';
import { User } from '@src/shared/user.decorator';
import { UserEntity } from '@src/user/user.entity';
import { Pagination } from 'nestjs-typeorm-paginate';
import { IArticleOutput } from './article.interface';
import { IUserOutput } from '@src/user/user.interface';

const MANY = 'articles';
const ONE = 'article';

@Controller('v1')
export class ArticleController {
  constructor(private readonly articleService: ArticleService) {}

  @Get(MANY)
  async findAll(
    @Query('current') page: number = 1,
    @Query('pageSize') limit: number = 10,
  ): Promise<Pagination<IArticleOutput>> {
    // nestjs 7.0 自动转换number,bool未传时则为NaN,false
    if (isNaN(page)) page = 1;
    if (isNaN(limit)) limit = 10;
    return await this.articleService.findAll({ page, limit });
  }

  @Get(`${ONE}/:uuid`)
  async findOne(@Param() paramDTO: UUIDParamDTO): Promise<IArticleOutput> {
    return <IArticleOutput>await this.articleService.findOne(paramDTO);
  }

  @UseGuards(AuthGuard)
  @Post(ONE)
  async create(
    @Body() articleDTO: CreateArticleDTO,
    @User() user: UserEntity,
  ): Promise<IArticleOutput> {
    return await this.articleService.create(articleDTO, user);
  }

  @UseGuards(AuthGuard)
  @Put(`${ONE}/:uuid`)
  async update(
    @Param() articleParamDTO: UUIDParamDTO,
    @Body() articleDTO: CreateArticleDTO,
    @User() user: UserEntity,
  ): Promise<IArticleOutput | string> {
    return await this.articleService.update(articleParamDTO, articleDTO, user);
  }

  @UseGuards(AuthGuard)
  @Delete(`${ONE}/:uuid`)
  async softDelete(
    @Param() articleParamDTO: UUIDParamDTO,
    @User() user: UserEntity,
  ): Promise<string> {
    return await this.articleService.softDelete(articleParamDTO, user);
  }

  @UseGuards(AuthGuard)
  @Patch(`${ONE}/:uuid`)
  async softRestore(
    @Param() articleParamDTO: UUIDParamDTO,
    user: UserEntity,
  ): Promise<string> {
    return await this.articleService.softRestore(articleParamDTO, user);
  }

  @UseGuards(AuthGuard)
  @Post(`${ONE}/:uuid/like`)
  async like(
    @Param() articleParamDTO: UUIDParamDTO,
    @User() user: UserEntity,
  ): Promise<IArticleOutput> {
    return await this.articleService.like(articleParamDTO, user);
  }

  @UseGuards(AuthGuard)
  @Post(`${ONE}/:uuid/bookmark`)
  async bookmark(
    @Param() articleParamDTO: UUIDParamDTO,
    @User() user: UserEntity,
  ): Promise<IUserOutput> {
    return await this.articleService.bookmark(articleParamDTO, user);
  }
}
