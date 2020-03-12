import {
  Injectable,
  Logger,
  InternalServerErrorException,
  BadRequestException,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ArticleEntity } from './article.entity';
import { Repository } from 'typeorm';
import { CreateArticleDTO } from './article.dto';
import { validate } from 'class-validator';
import { ParamDTO } from 'src/shared/shared.dto';
import { UserService } from 'src/user/user.service';

@Injectable()
export class ArticleService {
  private readonly logger: Logger = new Logger(ArticleService.name);
  private readonly relations = ['publisher', 'likes', 'bookmarkUsers'];

  constructor(
    @InjectRepository(ArticleEntity)
    private readonly articleRepository: Repository<ArticleEntity>,
    private readonly userService: UserService,
  ) {}

  /**
   * @description 验证器，传入的参数与entity中的字段验证比对，比对依据来自entity中的class-validator装饰器
   * @author Saxon
   * @date 2020-03-11
   * @private
   * @param {ArticleEntity} object
   * @memberof ArticleService
   */
  private async validator(object: ArticleEntity) {
    const errors = await validate(object);
    if (errors.length > 0) {
      throw new BadRequestException(errors, '验证失败');
    }
  }

  ensureOwnership(user, article: ArticleEntity) {
    if (article.publisher && article.publisher.id !== user.uuid) {
      throw new ForbiddenException('亲，不是您的文章无法操作');
    }
  }

  /**
   * @description 依据uuid查询一条数据，不存在则抛出404，公共调用
   * @author Saxon
   * @date 2020-03-12
   * @param {ParamDTO} paramDTO
   * @param {boolean} [returnsUserEntity=false]
   * @returns
   * @memberof ArticleService
   */
  async findOneByuuidForArticle(
    paramDTO: ParamDTO,
    returnsUserEntity: boolean = false,
  ) {
    const { uuid } = paramDTO;
    const article = await this.articleRepository.findOne(
      { uuid },
      {
        relations: this.relations,
      },
    );
    if (!article) {
      throw new NotFoundException('文章不存在');
    }
    if (returnsUserEntity) {
      return article;
    }
    return article.toResponseObject();
  }

  /**
   * @description 查询所有
   * @author Saxon
   * @date 2020-03-11
   * @returns
   * @memberof ArticleService
   */
  async findAll() {
    const articles = await this.articleRepository.find({
      relations: this.relations,
    });
    return articles.map(v => v.toResponseObject());
  }

  /**
   * @description 查询一条
   * @author Saxon
   * @date 2020-03-11
   * @param {ParamDTO} paramDTO
   * @returns
   * @memberof ArticleService
   */
  async findOne(paramDTO: ParamDTO) {
    return await this.findOneByuuidForArticle(paramDTO);
  }

  /**
   * @description 创建，DTO和Entity双重验证，60秒内防止重复提交
   * @author Saxon
   * @date 2020-03-11
   * @param {CreateArticleDTO} articleDTO
   * @param {*} user
   * @returns
   * @memberof ArticleService
   */
  async create(articleDTO: CreateArticleDTO, user) {
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

    created.publisher = user;

    try {
      const saved = await this.articleRepository.save(created);
      return saved.toResponseObject();
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(error.message, '服务器异常');
    }
  }

  /**
   * @description 更新
   * @author Saxon
   * @date 2020-03-11
   * @param {ParamDTO} paramDTO
   * @param {CreateArticleDTO} articleDTO
   * @returns
   * @memberof ArticleService
   */
  async update(paramDTO: ParamDTO, articleDTO: CreateArticleDTO, user) {
    const { uuid } = paramDTO;
    const { title, content } = articleDTO;
    if (!title && !content) {
      throw new BadRequestException('亲，参数不可为空');
    }
    const article = await this.findOneByuuidForArticle(paramDTO);
    this.ensureOwnership(user, article);

    if (
      (article.title === title && article.content === content) ||
      (!title && article.content === content) ||
      (!content && article.title === title)
    ) {
      throw new BadRequestException('亲，请修改后再提交');
    }

    try {
      const updated = await this.articleRepository.update({ uuid }, articleDTO);
      if (!updated.affected) {
        return '更新失败';
      }
      return await this.findOneByuuidForArticle(paramDTO);
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(error.message, '服务器异常');
    }
  }

  /**
   * @description 删除
   * @author Saxon
   * @date 2020-03-11
   * @param {ParamDTO} paramDTO
   * @param {*} user
   * @returns
   * @memberof ArticleService
   */
  async destroy(paramDTO: ParamDTO, user) {
    const { uuid } = paramDTO;
    const article = await this.findOneByuuidForArticle(paramDTO);
    this.ensureOwnership(user, article);

    try {
      const destroyed = await this.articleRepository.delete({ uuid });
      if (!destroyed.affected) {
        return '删除失败';
      }
      return '删除成功';
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(error.message, '服务器异常');
    }
  }

  /**
   * @description 点赞
   * @author Saxon
   * @date 2020-03-12
   * @param {ParamDTO} paramDTO
   * @param {*} user
   * @returns
   * @memberof ArticleService
   */
  async like(paramDTO: ParamDTO, user) {
    const { uuid } = paramDTO;
    const article = await this.findOneByuuidForArticle({ uuid }, true);
    // 本用户对该文章的点赞数
    const likeOfCurrentUser: number = article.likes.filter(
      v => v.id === user.id,
    ).length;

    if (!likeOfCurrentUser) {
      article.likes.push(user);
    } else {
      article.likes.splice(article.likes.indexOf(user), 1);
    }

    try {
      const saved = await this.articleRepository.save(article);
      return saved.toResponseObject();
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(error.message, '服务器异常');
    }
  }

  async bookmark(paramDTO: ParamDTO, user) {
    const { uuid } = paramDTO;
    const article = await this.findOneByuuidForArticle({ uuid }, true);
    if (article.user?.id === user.id) {
      throw new ForbiddenException('亲，这是您的文章嘢');
    }
    // 本用户对该文章的收藏数
    const bookmarkOfCurrentUser: number = user.bookmarks.filter(
      v => v.id === article.id,
    ).length;

    if (!bookmarkOfCurrentUser) {
      user.bookmarks.push(article);
    } else {
      user.bookmarks.splice(user.bookmarks.indexOf(article), 1);
    }

    try {
      const saved = await this.userService.bookmark(user);
      return saved.toResponseObject();
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(error.message, '服务器异常');
    }
  }
}
