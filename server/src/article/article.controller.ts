import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { ArticleService } from './article.service';
import { CreateArticleDTO } from './article.dto';
import { ParamDTO } from 'src/shared/shared.dto';

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

  @Post()
  async create(@Body() articleDTO: CreateArticleDTO) {
    return await this.articleService.create(articleDTO);
  }

  @Put(':uuid')
  async update(
    @Param() paramDTO: ParamDTO,
    @Body() articleDTO: CreateArticleDTO,
  ) {
    return await this.articleService.update(paramDTO, articleDTO);
  }

  @Delete(':uuid')
  async destroy(@Param() paramDTO: ParamDTO) {
    return await this.articleService.destroy(paramDTO);
  }
}
