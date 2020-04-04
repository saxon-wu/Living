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
import {
  CreateArticleDTO,
  UpdateArticleDTO,
  UpdateArticleDTOForAdmin,
} from './article.dto';
import { IdParamDTO } from '@src/shared/shared.dto';
import { AuthGuard } from '@src/shared/auth.guard';
import { User } from '@src/shared/user.decorator';
import { UserEntity } from '@src/user/user.entity';

const MANY = 'articles';
const ONE = 'article';

@UseGuards(AuthGuard)
@Controller('v1/admin')
export class AdminArticleController {
  constructor(private readonly articleService: ArticleService) {}

  @Get(MANY)
  async findAll(
    @Query('current') page: number = 1,
    @Query('pageSize') limit: number = 10,
  ) {
    // nestjs 7.0 自动转换number,bool未传时则为NaN,false
    if (isNaN(page)) page = 1;
    if (isNaN(limit)) limit = 10;
    return await this.articleService.findAllForAdmin({ page, limit });
  }

  @Get(`${ONE}/:id`)
  async findOne(@Param() paramDTO: IdParamDTO) {
    return await this.articleService.findOne(paramDTO);
  }

  @Put(`${ONE}/:id`)
  async update(
    @Param() articleParamDTO: IdParamDTO,
    @Body() articleDTO: UpdateArticleDTOForAdmin,
    @User() user: UserEntity,
  ) {
    return await this.articleService.updateForAdmin(
      articleParamDTO,
      articleDTO,
    );
  }
}
