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

const MANY = 'articles';
const ONE = 'article';

@Controller('v1')
export class ArticleController {
  constructor(private readonly articleService: ArticleService) {}

  @Get(MANY)
  async findAll() {
    return await this.articleService.findAll();
  }

  @Get(`${ONE}/:uuid`)
  async findOne(@Param() paramDTO: ParamDTO) {
    return await this.articleService.findOne(paramDTO);
  }

  @UseGuards(AuthGuard)
  @Post(ONE)
  async create(@Body() articleDTO: CreateArticleDTO, @User() user: UserEntity) {
    return await this.articleService.create(articleDTO, user);
  }

  @UseGuards(AuthGuard)
  @Put(`${ONE}/:uuid`)
  async update(
    @Param() articleParamDTO: ParamDTO,
    @Body() articleDTO: CreateArticleDTO,
    @User() user: UserEntity,
  ) {
    return await this.articleService.update(articleParamDTO, articleDTO, user);
  }

  @UseGuards(AuthGuard)
  @Delete(`${ONE}/:uuid`)
  async softDelete(
    @Param() articleParamDTO: ParamDTO,
    @User() user: UserEntity,
  ) {
    return await this.articleService.softDelete(articleParamDTO, user);
  }

  @UseGuards(AuthGuard)
  @Patch(`${ONE}/:uuid`)
  async softRestore(@Param() articleParamDTO: ParamDTO, user: UserEntity) {
    return await this.articleService.softRestore(articleParamDTO, user);
  }

  @UseGuards(AuthGuard)
  @Post(`${ONE}/:uuid/like`)
  async like(@Param() articleParamDTO: ParamDTO, @User() user: UserEntity) {
    return await this.articleService.like(articleParamDTO, user);
  }

  @UseGuards(AuthGuard)
  @Post(`${ONE}/:uuid/bookmark`)
  async bookmark(@Param() articleParamDTO: ParamDTO, @User() user: UserEntity) {
    return await this.articleService.bookmark(articleParamDTO, user);
  }
}
