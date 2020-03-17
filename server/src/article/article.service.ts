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
import { ParamDTO } from '@src/shared/shared.dto';
import { UserService } from '@src/user/user.service';
import { UserEntity } from '@src/user/user.entity';
import { plainToClass } from 'class-transformer';

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
  private async validator(object: ArticleEntity): Promise<void> {
    const errors = await validate(object);
    if (errors.length > 0) {
      throw new BadRequestException(errors, '验证失败');
    }
  }

  /**
   * @description 确保所有权
   * @author Saxon
   * @date 2020-03-15
   * @param {*} user
   * @param {ArticleEntity} article
   * @memberof ArticleService
   */
  ensureOwnership(user: UserEntity, article: ArticleEntity): void {
    if (article.publisher && (article.publisher.id as any) !== user.uuid) {
      throw new ForbiddenException('亲，不是您的文章无法操作');
    }
  }

  /**
   * @description 依据uuid查询一条数据，不存在则抛出404，公共调用
   * @author Saxon
   * @date 2020-03-12
   * @param {ParamDTO} articleParamDTO
   * @param {boolean} [returnsUserEntity=false]
   * @returns
   * @memberof ArticleService
   */
  async findOneByuuidForArticle(
    articleParamDTO: ParamDTO,
    returnsUserEntity: boolean = false,
  ) {
    const { uuid } = articleParamDTO;
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
   * @param {ParamDTO} articleParamDTO
   * @returns
   * @memberof ArticleService
   */
  async findOne(articleParamDTO: ParamDTO) {
    return await this.findOneByuuidForArticle(articleParamDTO);
  }

  /**
   * @description 创建，DTO和Entity双重验证，60秒内防止重复提交
   * @author Saxon
   * @date 2020-03-15
   * @param {CreateArticleDTO} articleDTO
   * @param {UserEntity} user
   * @returns
   * @memberof ArticleService
   */
  async create(articleDTO: CreateArticleDTO, user: UserEntity) {
    const { title, content } = articleDTO;
    const article = await this.articleRepository.findOne({ title });

    // 60 seconds 内不可重复提交
    if (article?.createdAt.getTime() + 60 * 1000 > Date.now()) {
      throw new ConflictException(
        '亲，系统阻止了，请确认是否重复提交，1分钟后可再次提交',
      );
    }
    const creatingArticle = this.articleRepository.create(articleDTO);

    creatingArticle.publisher = user;

    try {
      const savingArticle = await this.articleRepository.save(creatingArticle);
      return savingArticle.toResponseObject();
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(error.message, '服务器异常');
    }
  }

  /**
   * @description 更新
   * @author Saxon
   * @date 2020-03-15
   * @param {ParamDTO} articleParamDTO
   * @param {CreateArticleDTO} articleDTO
   * @param {UserEntity} user
   * @returns
   * @memberof ArticleService
   */
  async update(
    articleParamDTO: ParamDTO,
    articleDTO: CreateArticleDTO,
    user: UserEntity,
  ) {
    const { uuid } = articleParamDTO;
    const { title, content } = articleDTO;
    if (!title && !content) {
      throw new BadRequestException('亲，参数不可为空');
    }
    const article = await this.findOneByuuidForArticle(articleParamDTO);
    this.ensureOwnership(user, article);

    if (
      (article.title === title && article.content === content) ||
      (!title && article.content === content) ||
      (!content && article.title === title)
    ) {
      throw new BadRequestException('亲，请修改后再提交');
    }

    try {
      const updatingAticle = await this.articleRepository.update(
        { uuid },
        articleDTO,
      );
      if (!updatingAticle.affected) {
        return '更新失败';
      }
      return await this.findOneByuuidForArticle(articleParamDTO);
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(error.message, '服务器异常');
    }
  }

  /**
   * @description 软删除
   * @author Saxon
   * @date 2020-03-15
   * @param {ParamDTO} articleParamDTO
   * @param {UserEntity} user
   * @returns
   * @memberof ArticleService
   */
  async softDelete(articleParamDTO: ParamDTO, user: UserEntity) {
    const { uuid } = articleParamDTO;
    const article = await this.findOneByuuidForArticle(articleParamDTO);
    this.ensureOwnership(user, article);

    try {
      // 不检查数据库中是否存在实体
      const softDeletingAticle = await this.articleRepository.softDelete({
        uuid,
      });
      if (!softDeletingAticle.affected) {
        return '删除失败';
      }
      return '删除成功';
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(error.message, '服务器异常');
    }
  }

  /**
   * @description 恢复软删除的数据
   * @author Saxon
   * @date 2020-03-16
   * @param {ParamDTO} articleParamDTO
   * @returns
   * @memberof ArticleService
   */
  async softRestore(articleParamDTO: ParamDTO, user: UserEntity) {
    const { uuid } = articleParamDTO;

    try {
      // 不检查数据库中是否存在实体
      const softRestoringArticle = await this.articleRepository.restore({
        uuid,
      });
      if (!softRestoringArticle.affected) {
        return '恢复失败';
      }
      return '恢复成功';
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(error.message, '服务器异常');
    }
  }

  /**
   * @description 点赞
   * @author Saxon
   * @date 2020-03-15
   * @param {ParamDTO} articleParamDTO
   * @param {UserEntity} user
   * @returns
   * @memberof ArticleService
   */
  async like(articleParamDTO: ParamDTO, user: UserEntity) {
    const { uuid } = articleParamDTO;
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
      const savingArticle = await this.articleRepository.save(article);
      return savingArticle.toResponseObject();
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(error.message, '服务器异常');
    }
  }

  /**
   * @description 收藏
   * @author Saxon
   * @date 2020-03-15
   * @param {ParamDTO} articleParamDTO
   * @param {UserEntity} user
   * @returns
   * @memberof ArticleService
   */
  async bookmark(articleParamDTO: ParamDTO, user: UserEntity) {
    const { uuid } = articleParamDTO;
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
      const savingBookmarkByUser = await this.userService.bookmark(user);
      return savingBookmarkByUser.toResponseObject();
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(error.message, '服务器异常');
    }
  }
}
