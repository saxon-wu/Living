import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ArticleService } from './article.service';
import { CreateArticleDTO } from './article.dto';
import { ParamDTO } from 'src/shared/shared.dto';
import { AuthGuard } from 'src/shared/auth.guard';
import { User } from 'src/shared/user.decorator';
import { UserEntity } from 'src/user/user.entity';

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
    @Param() paramDTO: ParamDTO,
    @Body() articleDTO: CreateArticleDTO,
    @User() user,
  ) {
    return await this.articleService.update(paramDTO, articleDTO, user);
  }

  @UseGuards(AuthGuard)
  @Delete(':uuid')
  async destroy(@Param() paramDTO: ParamDTO, @User() user) {
    return await this.articleService.destroy(paramDTO, user);
  }
}
