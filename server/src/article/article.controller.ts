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

@Controller('article')
export class ArticleController {
  constructor(private readonly articleService: ArticleService) {}

  @Get()
  async findAll() {
    return await this.articleService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.articleService.findOne(id);
  }

  @Post()
  async create(@Body() articleDTO: CreateArticleDTO) {
    return await this.articleService.create(articleDTO);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() articleDTO: CreateArticleDTO) {
    return await this.articleService.update(id, articleDTO);
  }

  @Delete(':id')
  async destroy(@Param('id') id: string) {
    return await this.articleService.destroy(id);
  }
}
