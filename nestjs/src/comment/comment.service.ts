import {
  Injectable,
  Logger,
  InternalServerErrorException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CommentEntity } from './comment.entity';
import { Repository } from 'typeorm';
import { UUIDParamDTO } from '@src/shared/shared.dto';
import { CreateCommentDTO } from './comment.dto';
import { ArticleService } from '@src/article/article.service';
import { UserEntity } from '@src/user/user.entity';
import { ArticleEntity } from '@src/article/article.entity';
import { ICommentOutput } from './comment.interface';
import {
  paginate,
  Pagination,
  IPaginationOptions,
} from 'nestjs-typeorm-paginate';
import { transformRelations } from '@src/shared/helper.util';
import { SortEnum } from '@src/shared/shared.enum';

@Injectable()
export class CommentService {
  private readonly logger: Logger = new Logger(CommentService.name);
  private readonly relations = [
    'commenter',
    'commenter.avatar',
    'likes',
    'replies',
    'replies.likes',
    'replies.replier',
    'replies.replier.avatar',
  ];
  private readonly table = 'comment';

  constructor(
    @InjectRepository(CommentEntity)
    private readonly commentRepository: Repository<CommentEntity>,
    private readonly articleService: ArticleService,
  ) {}

  /**
   * @description 亲子关联
   * 同址无需使用return
   * @author Saxon
   * @date 2020-03-15
   * @param {any[]} data
   * @memberof CommentService
   */
  private parentChildRelationship(data: any[], article?: ArticleEntity) {
    for (const child of data) {
      if (article && child.replier.id === article.publisher.id) {
        child.isOwnership = true;
      }
      for (const parent of data) {
        if (child.parentId === parent.id) {
          const parentReplierUsername = parent.replier?.username;
          // 引入原话
          // child.content = `回复@${parentReplierUsername}: ${child.content} {${parentReplierUsername} ${parent.content}}`;
          // 不引入原话
          child.content = `回复@${parentReplierUsername}: ${child.content}`;
        }
      }
    }
  }

  /**
   * @description 无限递归
   * v.parent?.id == id
   * parent为null时v.parent?.id为undefined，undefined==null为true
   * parent为0时v.parent?.id也为undefined
   * NOTICE: 不可用 ===
   * @author Saxon
   * @date 2020-03-13
   * @param {any[]} data
   * @param {(null | number)} starting 起始点 NOTICE:只适配值为null，未适配0
   * @returns {CommentEntity[]}
   * @memberof CommentService
   */
  infiniteRecursion(data: any[], starting: null | number): CommentEntity[] {
    return (function x(id) {
      return data
        .filter(v => v.parent?.id == id)
        .map(v => ({ ...v, children: x(v.id) }));
    })(starting);
  }

  /**
   * @description 依据uuid查询一条数据，不存在则抛出404，公共调用
   * @author Saxon
   * @date 2020-03-13
   * @param {UUIDParamDTO} paramDTO
   * @returns {Promise<CommentEntity>}
   * @memberof CommentService
   */
  async findOneForComment(paramDTO: UUIDParamDTO): Promise<CommentEntity> {
    let comment: CommentEntity;
    if ((paramDTO as UUIDParamDTO).id) {
      const { id } = <UUIDParamDTO>paramDTO;
      comment = await this.commentRepository.findOne(id, {
        relations: this.relations,
      });
    } else {
      throw new BadRequestException('亲，传入的参数不正确');
    }

    if (!comment) {
      throw new NotFoundException('评论不存在');
    }

    this.parentChildRelationship(comment.replies);

    // if (returnsEntity) {
    //   return comment;
    // }
    return comment;
  }

  /**
   * @description 查询所有评论
   * @author Saxon
   * @date 2020-03-13
   * @param {UUIDParamDTO} paramDTO
   * @param {IPaginationOptions} options
   * @param {SortEnum} sort
   * @param {boolean} [isAdminSide=false]
   * @returns {Promise<Pagination<CommentEntity>>}
   * @memberof CommentService
   */
  async findAll(
    paramDTO: UUIDParamDTO,
    options: IPaginationOptions,
    sort: SortEnum,
    isAdminSide: boolean = false,
  ): Promise<Pagination<CommentEntity>> {
    const article = <ArticleEntity>(
      await this.articleService.findOneForArticle(paramDTO)
    );

    const queryBuilder = this.commentRepository
      .createQueryBuilder(this.table)
      .where(`${this.table}.article_id = :articleId`, { articleId: article.id })
      .orderBy(`${this.table}.createdAt`, sort);

    for (const item of transformRelations(this.table, this.relations)) {
      queryBuilder.leftJoinAndSelect(item.property, item.alias);
    }

    const comments: Pagination<CommentEntity> = await paginate<CommentEntity>(
      queryBuilder,
      options,
    );

    return {
      ...comments,
      items: comments.items.map(v => {
        if (v.commenter.id === article.publisher.id) {
          v.isOwnership = true;
        }

        this.parentChildRelationship(v.replies, article);
        return v;
      }),
    };
  }

  /**
   * @description 查询一条
   * @author Saxon
   * @date 2020-03-13
   * @param {UUIDParamDTO} paramDTO
   * @returns {(Promise<CommentEntity | ICommentOutput>)}
   * @memberof CommentService
   */
  async findOne(paramDTO: UUIDParamDTO): Promise<CommentEntity> {
    return await this.findOneForComment(paramDTO);
  }

  /**
   * @description 发表评论或回复评论
   * @author Saxon
   * @date 2020-03-13
   * @param {CreateCommentDTO} createOrRelyComment
   * @param {UserEntity} user
   * @returns {Promise<ICommentOutput>}
   * @memberof CommentService
   */
  async create(
    createCommentDTO: CreateCommentDTO,
    user: UserEntity,
  ): Promise<CommentEntity> {
    const { content, articleId } = createCommentDTO;

    const article = <ArticleEntity>(
      await this.articleService.findOneForArticle({ id: articleId })
    );

    // 发表评论
    const creatingComment = this.commentRepository.create({ content });
    creatingComment.commenter = user;
    creatingComment.article = article;
    try {
      const savingComment = await this.commentRepository.save(creatingComment);
      return savingComment;
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(error.message, '服务器异常');
    }
  }

  /**
   * @description 为评论或回复点赞
   * @author Saxon
   * @date 2020-03-13
   * @param {UUIDParamDTO} paramDTO
   * @param {UserEntity} user
   * @returns {Promise<ICommentOutput>}
   * @memberof CommentService
   */
  async like(paramDTO: UUIDParamDTO, user: UserEntity): Promise<CommentEntity> {
    // 评论
    const { id } = paramDTO;
    const comment = (await this.findOneForComment({ id })) as CommentEntity;
    // 本用户对该评论的点赞数，作为点赞的反相操作
    const likeOfCurrentUser: number = comment.likes.filter(
      v => v.id === user.id,
    ).length;

    if (!likeOfCurrentUser) {
      comment.likes.push(user);
      comment.likesCount = comment.likesCount + 1;
    } else {
      const index = comment.likes.findIndex(v => v.id === user.id);
      comment.likes.splice(index, 1);
      comment.likesCount = comment.likesCount - 1;
    }

    try {
      // 上面取到的comment已包含关联数据，这里save之后也保留着先前的数据，包含已修改和未修改的
      const savingComment = await this.commentRepository.save(comment);
      return savingComment;
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(error.message, '服务器异常');
    }
  }
}
