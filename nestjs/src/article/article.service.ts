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
import {
  CreateArticleDTO,
  UpdateArticleDTO,
  UpdateArticleDTOForAdmin,
} from './article.dto';
import { validate } from 'class-validator';
import { UUIDParamDTO, TitleParamDTO } from '@src/shared/shared.dto';
import { UserService } from '@src/user/user.service';
import { UserEntity } from '@src/user/user.entity';
import {
  paginate,
  Pagination,
  IPaginationOptions,
} from 'nestjs-typeorm-paginate';
import { ArticleStatusEnum } from './article.enum';
import { IUserOutput } from '@src/user/user.interface';
import { transformRelations } from '@src/shared/helper.util';
import { FileService } from '@src/file/file.service';
import { NOT_FOUND_IMAGE } from '@src/shared/constant';
import { IFileProperty } from '@src/file/file.interface';
import { FilePurposeEnum } from '@src/file/file.enum';

@Injectable()
export class ArticleService {
  private readonly logger: Logger = new Logger(ArticleService.name);
  private readonly relations = [
    'publisher',
    'likes',
    'likes.avatar',
    // 'favoriteUsers',
    // 'comments',
    'publisher.avatar',
    'cover',
  ];
  private readonly table = 'article';

  constructor(
    @InjectRepository(ArticleEntity)
    private readonly articleRepository: Repository<ArticleEntity>,
    private readonly userService: UserService,
    private readonly fileService: FileService,
  ) {}

  /**
   * @description 验证器，传入的参数与entity中的字段验证比对，比对依据来自entity中的class-validator装饰器
   * @author Saxon
   * @date 2020-03-11
   * @private
   * @param {ArticleEntity} object
   * @returns {Promise<void>}
   * @memberof ArticleService
   */
  private async validator(object: ArticleEntity): Promise<void> {
    const errors = await validate(object);
    if (errors.length > 0) {
      throw new BadRequestException(errors, '验证失败');
    }
  }

  /**
   * @description Editor.js 编辑器输出的数据验证
   * @author Saxon
   * @date 2020-04-27
   * @private
   * @param {*} content
   * @memberof ArticleService
   */
  private editorjsFormatValidator(content: any) {
    if (
      !content.blocks ||
      !Array.isArray(content.blocks) ||
      !content.blocks.length
    ) {
      throw new BadRequestException('亲，内容格式不对哦');
    }
  }

  /**
   * @description 确保所有权
   * @author Saxon
   * @date 2020-03-15
   * @param {UserEntity} user
   * @param {ArticleEntity} article
   * @memberof ArticleService
   */
  ensureOwnership(user: UserEntity, article: ArticleEntity): void {
    if (article.publisher && article.publisher.id !== user.id) {
      throw new ForbiddenException('亲，不是您的文章无法操作');
    }
  }

  /**
   * @description 依据uuid查询一条数据，不存在则抛出404，公共调用
   * @author Saxon
   * @date 2020-03-12
   * @param {(UUIDParamDTO | TitleParamDTO)} paramDTO
   * @param {(UserEntity | null)} [user]
   * @returns {Promise<ArticleEntity>}
   * @memberof ArticleService
   */
  async findOneForArticle(
    paramDTO: UUIDParamDTO | TitleParamDTO,
    user?: UserEntity | null,
  ): Promise<ArticleEntity> {
    let article: ArticleEntity;
    if ((paramDTO as TitleParamDTO).title) {
      const { title } = <TitleParamDTO>paramDTO;
      article = await this.articleRepository.findOne(
        { title },
        {
          relations: this.relations,
        },
      );
    } else if ((paramDTO as UUIDParamDTO).id) {
      const { id } = <UUIDParamDTO>paramDTO;
      article = await this.articleRepository.findOne(id, {
        relations: this.relations,
      });
    } else {
      throw new BadRequestException('亲，传入的参数不正确');
    }

    if (!article) {
      throw new NotFoundException('文章不存在');
    }

    if (article.publisher.id === user?.id) {
      article.isOwnership = true;
    }

    // 根据file的id获取filename，拼接成url
    for (const v of article.content.blocks) {
      if (v.type === 'image') {
        const id = (v.data as any).file?.id;
        let filename = null;
        if (!id) {
          // 文章中的图片不存在，生成占位图，避免报错和图片空缺
          await this.fileService.makePlaceholder(
            NOT_FOUND_IMAGE.text,
            NOT_FOUND_IMAGE.filename,
          );
          filename = NOT_FOUND_IMAGE.filename;
        } else {
          const file = await this.fileService.findOneForFile({ id });
          filename = file.filename;
        }
      }
    }
    return article;
  }

  /**
   * @description 查询所有
   * @author Saxon
   * @date 2020-03-11
   * @param {IPaginationOptions} options
   * @param {boolean} [isAdminSide=false]
   * @returns {Promise<Pagination<IArticleOutput>>}
   * @memberof ArticleService
   */
  async findAll(
    options: IPaginationOptions,
    isAdminSide: boolean = false,
  ): Promise<Pagination<ArticleEntity>> {
    const queryBuilder = this.articleRepository.createQueryBuilder(this.table);
    queryBuilder.orderBy(`${this.table}.createdAt`, 'DESC');
    if (!isAdminSide) {
      queryBuilder.where(`${this.table}.isPublic`, { isPublic: true });
    }
    for (const item of transformRelations(this.table, this.relations)) {
      queryBuilder.leftJoinAndSelect(item.property, item.alias);
    }
    const articles: Pagination<ArticleEntity> = await paginate<ArticleEntity>(
      queryBuilder,
      options,
    );

    return articles;
  }

  /**
   * @description 查询一条 输出给客户端
   * @author Saxon
   * @date 2020-03-11
   * @param {(UUIDParamDTO | TitleParamDTO)} paramDTO
   * @param {(UserEntity | null)} [user]
   * @returns {Promise<ArticleEntity>}
   * @memberof ArticleService
   */
  async findOne(
    paramDTO: UUIDParamDTO | TitleParamDTO,
    user?: UserEntity | null,
  ): Promise<ArticleEntity> {
    return await this.findOneForArticle(paramDTO, user);
  }

  /**
   * @description 创建，DTO和Entity双重验证，60秒内防止重复提交
   * @author Saxon
   * @date 2020-03-15
   * @param {CreateArticleDTO} articleDTO
   * @param {UserEntity} user
   * @returns {Promise<IArticleOutput>}
   * @memberof ArticleService
   */
  async create(
    articleDTO: CreateArticleDTO,
    user: UserEntity,
  ): Promise<ArticleEntity> {
    const { title, content, coverId } = articleDTO;
    this.editorjsFormatValidator(content);
    const article = await this.articleRepository.findOne({ title });

    // 60 seconds 内不可重复提交
    if (article) {
      const timestamp = new Date(article.createdAt).valueOf();
      if (timestamp + 60 * 1000 > Date.now()) {
        throw new ConflictException(
          '亲，系统阻止了，请确认是否重复提交，1分钟后可再次提交',
        );
      }
    }
    const creatingArticle = this.articleRepository.create(articleDTO);
    if (!coverId) {
      const fileProperty = <IFileProperty>(
        await this.fileService.makePlaceholder(
          title,
          /*filename*/ null,
          /*returnFileProperty*/ true,
        )
      );
      const cover = await this.fileService.createSingleByFile(
        { ...fileProperty, uploader: user },
        { purpose: FilePurposeEnum.COVER },
        user,
      );
      creatingArticle.cover = cover;
    }

    creatingArticle.publisher = user;

    try {
      const savingArticle = await this.articleRepository.save(creatingArticle);
      return savingArticle;
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(error.message, '服务器异常');
    }
  }

  /**
   * @description 更新
   * @author Saxon
   * @date 2020-03-15
   * @param {UUIDParamDTO} paramDTO
   * @param {UpdateArticleDTO} articleDTO
   * @param {UserEntity} user
   * @returns {(Promise<ArticleEntity | string>)}
   * @memberof ArticleService
   */
  async update(
    paramDTO: UUIDParamDTO,
    articleDTO: UpdateArticleDTO,
    user: UserEntity,
  ): Promise<ArticleEntity | string> {
    const { id } = paramDTO;
    const { title, content } = articleDTO;
    if (!title && !content) {
      throw new BadRequestException('亲，参数不可为空');
    }
    this.editorjsFormatValidator(content);
    const article = await this.findOneForArticle(paramDTO);

    this.ensureOwnership(user, article);

    try {
      const updatingAticle = await this.articleRepository.update(
        id,
        articleDTO,
      );
      if (!updatingAticle.affected) {
        return '更新失败';
      }
      return await this.findOneForArticle(paramDTO);
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(error.message, '服务器异常');
    }
  }

  /**
   * @description 软删除
   * @author Saxon
   * @date 2020-04-10
   * @param {UUIDParamDTO} paramDTO
   * @param {UserEntity} user
   * @returns {Promise<string>}
   * @memberof ArticleService
   */
  async softDelete(paramDTO: UUIDParamDTO, user: UserEntity): Promise<string> {
    const { id } = paramDTO;
    const article = <ArticleEntity>await this.findOneForArticle(paramDTO);
    this.ensureOwnership(user, article);

    try {
      // 不检查数据库中是否存在实体
      const softDeletingAticle = await this.articleRepository.softDelete(id);
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
   * @param {UUIDParamDTO} paramDTO
   * @param {UserEntity} user
   * @returns {Promise<string>}
   * @memberof ArticleService
   */
  async softRestore(paramDTO: UUIDParamDTO, user: UserEntity): Promise<string> {
    const { id } = paramDTO;

    try {
      // 不检查数据库中是否存在实体
      const softRestoringArticle = await this.articleRepository.restore(id);
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
   * @param {UUIDParamDTO} paramDTO
   * @param {UserEntity} user
   * @returns {Promise<ArticleEntity>}
   * @memberof ArticleService
   */
  async like(paramDTO: UUIDParamDTO, user: UserEntity): Promise<ArticleEntity> {
    const { id } = paramDTO;
    const article = <ArticleEntity>await this.findOneForArticle({ id });
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
      return savingArticle;
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(error.message, '服务器异常');
    }
  }

  /**
   * @description 收藏
   * @author Saxon
   * @date 2020-04-10
   * @param {UUIDParamDTO} paramDTO
   * @param {UserEntity} user
   * @returns {Promise<UserEntity>}
   * @memberof ArticleService
   */
  async favorites(
    paramDTO: UUIDParamDTO,
    user: UserEntity,
  ): Promise<UserEntity> {
    const { id } = paramDTO;
    const article = <ArticleEntity>await this.findOneForArticle({ id });
    if (article.publisher?.id === user.id) {
      throw new ForbiddenException('亲，这是您的文章嘢');
    }
    const _user = await this.userService.findAllFavorites(user);

    // 本用户对该文章的收藏数
    const favoriteOfCurrentUser: number = _user.favorites.filter(
      v => v.id === article.id,
    ).length;

    if (!favoriteOfCurrentUser) {
      _user.favorites.push(article);
    } else {
      _user.favorites.splice(_user.favorites.indexOf(article), 1);
    }

    try {
      const savingFavoriteByUser = await this.userService.createFavorite(_user);
      return savingFavoriteByUser;
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(error.message, '服务器异常');
    }
  }

  /** ------------------------------------ADMIN------------------------------------------ */

  /**
   * @description 更新
   * @author Saxon
   * @date 2020-04-10
   * @param {UUIDParamDTO} paramDTO
   * @param {UpdateArticleDTOForAdmin} articleDTO
   * @returns {(Promise<string | null>)}
   * @memberof ArticleService
   */
  async updateForAdmin(
    paramDTO: UUIDParamDTO,
    articleDTO: UpdateArticleDTOForAdmin,
  ): Promise<string | null> {
    const { id } = paramDTO;
    const { status } = articleDTO;
    const article = <ArticleEntity>await this.findOneForArticle(paramDTO);

    switch (status) {
      case ArticleStatusEnum.NORMAL:
        articleDTO.status = ArticleStatusEnum.NORMAL;
        break;
      case ArticleStatusEnum.DISABLED:
        articleDTO.status = ArticleStatusEnum.DISABLED;
        break;
      default:
        throw new BadRequestException('亲，传入的参数不正确');
    }

    try {
      const updatingAticle = await this.articleRepository.update(
        id,
        articleDTO,
      );
      if (!updatingAticle.affected) {
        return '更新失败';
      }
      return null;
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(error.message, '服务器异常');
    }
  }
}
