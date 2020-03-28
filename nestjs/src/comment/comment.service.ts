import {
  Injectable,
  Logger,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CommentEntity } from './comment.entity';
import { Repository } from 'typeorm';
import { ParamDTO } from '@src/shared/shared.dto';
import { CreateCommentDTO } from './comment.dto';
import { ArticleService } from '@src/article/article.service';
import { UserEntity } from '@src/user/user.entity';

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
   * @date 2020-03-12
   * @param {ParamDTO} paramDTO
   * @param {boolean} [returnsUserEntity=false]
   * @returns
   * @memberof CommentService
   */
  async findOneByuuidForComment(
    paramDTO: ParamDTO,
    returnsUserEntity: boolean = false,
  ) {
    const { uuid } = paramDTO;
    const comment = await this.commentRepository.findOne(
      { uuid },
      {
        relations: this.relations,
      },
    );

    if (!comment) {
      throw new NotFoundException('评论不存在');
    }

    this.parentChildRelation(comment.replies);

    if (returnsUserEntity) {
      return comment;
    }
    return comment.toResponseObject();
  }

  /**
   * @description 查询所有评论
   * @author Saxon
   * @date 2020-03-13
   * @param {ParamDTO} articleParamDTO
   * @returns
   * @memberof CommentService
   */
  async findAll(articleParamDTO: ParamDTO) {
    const { uuid } = articleParamDTO;
    const article = await this.articleService.findOneByuuidForArticle(
      { uuid },
      true,
    );
    const comment = await this.commentRepository.find({
      relations: this.relations,
    });

    return comment.map(v => {
      this.parentChildRelation(v.replies);
      return v.toResponseObject();
    });
  }

  async findOne(commentParamDto: ParamDTO) {
    return await this.findOneByuuidForComment(commentParamDto);
  }

  /**
   * @description 发表评论或回复评论
   * @author Saxon
   * @date 2020-03-15
   * @param {CreateCommentDTO} createOrRelyComment
   * @param {UserEntity} user
   * @returns
   * @memberof CommentService
   */
  async create(createOrRelyComment: CreateCommentDTO, user: UserEntity) {
    const { content, articleId } = createOrRelyComment;

    const article = await this.articleService.findOneByuuidForArticle(
      { uuid: articleId },
      true,
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
   * @date 2020-03-15
   * @param {ParamDTO} commentParamDTO
   * @param {UserEntity} user
   * @returns
   * @memberof CommentService
   */
  async like(commentParamDTO: ParamDTO, user: UserEntity) {
    // 评论
    const { uuid } = commentParamDTO;
    const comment = (await this.findOneByuuidForComment(
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
