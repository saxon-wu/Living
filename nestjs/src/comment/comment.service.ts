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
import { UUIDParamDTO, IdParamDTO } from '@src/shared/shared.dto';
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

@Injectable()
export class CommentService {
  private readonly logger: Logger = new Logger(CommentService.name);
  private readonly relations = [
    'commenter',
    'likes',
    'replies',
    'replies.replier',
    'replies.likes',
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
  parentChildRelation(data: any[]) {
    for (const child of data) {
      for (const parent of data) {
        if (child.parentId === parent.id) {
          const parentReplierUsername = parent.replier?.username;
          child.content = `回复@${parentReplierUsername}: ${child.content} {${parentReplierUsername} ${parent.content}}`;
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
   * @param {(UUIDParamDTO | IdParamDTO)} paramDTO
   * @param {boolean} [returnsEntity=false]
   * @returns {(Promise<CommentEntity | ICommentOutput>)}
   * @memberof CommentService
   */
  async findOneForComment(
    paramDTO: UUIDParamDTO | IdParamDTO,
    returnsEntity: boolean = false,
  ): Promise<CommentEntity | ICommentOutput> {
    let comment: CommentEntity;
    if ((paramDTO as UUIDParamDTO).uuid) {
      const { uuid } = <UUIDParamDTO>paramDTO;
      comment = await this.commentRepository.findOne(
        { uuid },
        {
          relations: this.relations,
        },
      );
    } else if ((paramDTO as IdParamDTO).id) {
      const { id } = <IdParamDTO>paramDTO;
      comment = await this.commentRepository.findOne(id, {
        relations: this.relations,
      });
    } else {
      throw new BadRequestException('亲，传入的参数不正确');
    }

    if (!comment) {
      throw new NotFoundException('评论不存在');
    }

    this.parentChildRelation(comment.replies);

    if (returnsEntity) {
      return comment;
    }
    return comment.toResponseObject();
  }

  /**
   * @description 查询所有评论
   * @author Saxon
   * @date 2020-03-13
   * @param {(UUIDParamDTO | IdParamDTO)} paramDTO
   * @param {IPaginationOptions} options
   * @param {boolean} [isAdminSide=false]
   * @returns {Promise<Pagination<ICommentOutput>>}
   * @memberof CommentService
   */
  async findAll(
    paramDTO: UUIDParamDTO | IdParamDTO,
    options: IPaginationOptions,
    isAdminSide: boolean = false,
  ): Promise<Pagination<ICommentOutput>> {
    const article = await this.articleService.findOneForArticle(
      paramDTO,
      /* returnsEntity */ true,
    );

    const queryBuilder = this.commentRepository.createQueryBuilder(this.table);
    for (const item of this.relations) {
      const hasDot = item.includes('.');
      queryBuilder.leftJoinAndSelect(
        hasDot ? item : `${this.table}.${item}`,
        hasDot ? item.replace(/\./, '_') : item,
      );
    }
    /*
    上面处理后类似如此：
    queryBuilder.leftJoinAndSelect('comment.commenter', 'commenter');
    queryBuilder.leftJoinAndSelect('comment.likes', 'likes');
    queryBuilder.leftJoinAndSelect('comment.replies', 'replies');
    queryBuilder.leftJoinAndSelect('replies.replier', 'replies_replier');
    queryBuilder.leftJoinAndSelect('replies.likes', 'replies_likes');
    */

    const comments: Pagination<CommentEntity> = await paginate<CommentEntity>(
      queryBuilder,
      options,
    );

    if (isAdminSide) {
      return {
        ...comments,
        items: comments.items.map(v => {
          this.parentChildRelation(v.replies);
          return v.toResponseObject(/**isAdminSide */ true);
        }),
      };
    }

    return {
      ...comments,
      items: comments.items.map(v => {
        this.parentChildRelation(v.replies);
        return v.toResponseObject();
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
  async findOne(
    paramDTO: UUIDParamDTO,
  ): Promise<CommentEntity | ICommentOutput> {
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
    createOrRelyComment: CreateCommentDTO,
    user: UserEntity,
  ): Promise<ICommentOutput> {
    const { content, articleId } = createOrRelyComment;

    const article = <ArticleEntity>(
      await this.articleService.findOneForArticle({ uuid: articleId }, true)
    );

    // 发表评论
    const creatingComment = this.commentRepository.create({ content });
    creatingComment.commenter = user;
    creatingComment.article = article;
    try {
      const savingComment = await this.commentRepository.save(creatingComment);
      return savingComment.toResponseObject();
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
  async like(
    paramDTO: UUIDParamDTO,
    user: UserEntity,
  ): Promise<ICommentOutput> {
    // 评论
    const { uuid } = paramDTO;
    const comment = (await this.findOneForComment(
      { uuid },
      true,
    )) as CommentEntity;
    // 本用户对该评论的点赞数，作为点赞的反响操作
    const likeOfCurrentUser: number = comment.likes.filter(
      v => v.id === user.id,
    ).length;

    if (!likeOfCurrentUser) {
      comment.likes.push(user);
    } else {
      comment.likes.splice(comment.likes.indexOf(user), 1);
    }
    try {
      const savingComment = await this.commentRepository.save(comment);
      return savingComment.toResponseObject();
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(error.message, '服务器异常');
    }
  }
}
