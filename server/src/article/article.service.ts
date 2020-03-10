import {
  Injectable,
  Logger,
  InternalServerErrorException,
  BadRequestException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ArticleEntity } from './article.entity';
import { Repository } from 'typeorm';
import { CreateArticleDTO } from './article.dto';
import { validate } from 'class-validator';

@Injectable()
export class ArticleService {
  private readonly logger: Logger = new Logger(ArticleService.name);

  constructor(
    @InjectRepository(ArticleEntity)
    private readonly articleRepository: Repository<ArticleEntity>,
  ) {}

  private async validator(object: ArticleEntity) {
    const errors = await validate(object);
    if (errors.length > 0) {
      throw new BadRequestException(errors, '验证失败');
    }
  }
  async findOneByuuidForArticle(uuid: string) {
    const article = await this.articleRepository.findOne({ uuid });
    if (!article) {
      throw new NotFoundException('文章不存在');
    }
    return article.toResponseObject();
  }

  async findAll() {
    const articles = await this.articleRepository.find();
    return articles.map(v => v.toResponseObject());
  }

  async findOne(uuid: string) {
    return await this.findOneByuuidForArticle(uuid);
  }

  async create(articleDTO: CreateArticleDTO) {
    const created = this.articleRepository.create(articleDTO);

    await this.validator(created);

    const { title, content } = articleDTO;
    const article = await this.articleRepository.findOne({ title });

    // 60 seconds 内不可重复提交
    if (article?.createdAt.getTime() + 60 * 1000 > Date.now()) {
      throw new ConflictException(
        '亲，系统阻止了，请确认是否重复提交，1分钟后可再次提交',
      );
    }

    try {
      const saved = await this.articleRepository.save(created);
      return saved.toResponseObject();
    } catch (error) {
      this.logger.error(error?.message);
      throw new InternalServerErrorException(error?.message, '服务器异常');
    }
  }

  async update(uuid: string, articleDTO: CreateArticleDTO) {
    const { title, content } = articleDTO;
    if (!title && !content) {
      throw new BadRequestException('亲，参数不可为空');
    }
    const article = await this.findOneByuuidForArticle(uuid);
    if (
      (article.title === title && article.content === content) ||
      (!title && article.content === content) ||
      (!content && article.title === title)
    ) {
      throw new BadRequestException('亲，请修改后再提交');
    }
    const updated = await this.articleRepository.update({ uuid }, articleDTO);
    if (!updated.affected) {
      return '更新失败';
    }
    return await this.findOneByuuidForArticle(uuid);
  }

  async destroy(uuid: string) {
    await this.findOneByuuidForArticle(uuid);
    const destroyed = await this.articleRepository.delete({ uuid });
    if (!destroyed.affected) {
      return '删除失败';
    }
    return '删除成功';
  }
}
