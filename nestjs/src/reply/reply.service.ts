import {
  Injectable,
  Logger,
  InternalServerErrorException,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { CommentService } from '@src/comment/comment.service';
import { InjectRepository } from '@nestjs/typeorm';
import { CommentEntity } from '@src/comment/comment.entity';
import { Repository } from 'typeorm';
import { ReplyEntity } from './reply.entity';
import { ParamDTO } from '@src/shared/shared.dto';
import { CreateReplyDTO } from './reply.dto';
import { UserEntity } from '@src/user/user.entity';

@Injectable()
export class ReplyService {
  private readonly logger: Logger = new Logger(CommentService.name);
  private readonly relations = [
    // 'commenter',
    'replier',
    'likes',
    'comment', // 确保要创建的回复与目标与回复属同一评论
    // 'replies',
    // 'replies.replier',
    // 'replies.parent',
    // 'replies.parent.replier',
    // 'replies.likes',
  ];

  constructor(
    @InjectRepository(ReplyEntity)
    private readonly replyRepository: Repository<ReplyEntity>,
    private readonly commentService: CommentService,
  ) {}

  ensureOwnership(user: UserEntity, reply: ReplyEntity): void {
    if (reply.replier && (reply.replier.id as any) !== user.uuid) {
      throw new ForbiddenException('亲，不是您的回复无法操作');
    }
  }

  async findOneByuuidForReply(
    paramDTO: ParamDTO,
    returnsUserEntity: boolean = false,
  ) {
    const { uuid } = paramDTO;
    const reply = await this.replyRepository.findOne(
      { uuid },
      {
        relations: this.relations,
      },
    );
    if (!reply) {
      throw new NotFoundException('回复不存在');
    }
    if (returnsUserEntity) {
      return reply;
    }
    return reply.toResponseObject();
  }

  /**
   * @description 创建回复
   * @author Saxon
   * @date 2020-03-14
   * @param {CreateReplyDTO} createReplyDTO
   * @param {UserEntity} user
   * @returns
   * @memberof ReplyService
   */
  async create(createReplyDTO: CreateReplyDTO, user: UserEntity) {
    const { commentId, content, replyParentId } = createReplyDTO;

    const comment = (await this.commentService.findOneByuuidForComment(
      { uuid: commentId },
      true,
    )) as CommentEntity;

    const creating = this.replyRepository.create({ content });
    creating.comment = comment;
    creating.replier = user;
    if (replyParentId) {
      const replyParent = (await this.findOneByuuidForReply(
        { uuid: replyParentId },
        true,
      )) as ReplyEntity;
      //   确保回复的目标也是同一条评论下的
      if (replyParent.comment && replyParent.comment.id !== comment.id) {
        throw new BadRequestException('亲，参数不正确哦');
      }
      creating.parentId = replyParent.id;
    }

    try {
      const savingReply = await this.replyRepository.save(creating);
      return savingReply.toResponseObject();
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(error.message, '服务器异常');
    }
  }

  /**
   * @description 软删除，不检查数据库中是否存在实体
   * @author Saxon
   * @date 2020-03-14
   * @param {ParamDTO} replyParamDTO
   * @returns
   * @memberof ReplyService
   */
  async softDelete(replyParamDTO: ParamDTO, user: UserEntity) {
    const { uuid } = replyParamDTO;
    const reply = await this.findOneByuuidForReply(replyParamDTO) as ReplyEntity;
    this.ensureOwnership(user, reply);

    try {
      const softDeletingReply = await this.replyRepository.softDelete({ uuid });
      if (!softDeletingReply.affected) {
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
   * @date 2020-03-14
   * @param {ParamDTO} replyParamDTO
   * @returns
   * @memberof ReplyService
   */
  async softRestore(replyParamDTO: ParamDTO, user:UserEntity) {
    const { uuid } = replyParamDTO;
    const reply = await this.findOneByuuidForReply(replyParamDTO) as ReplyEntity;
    this.ensureOwnership(user, reply);

    try {
      const softRestoringReply = await this.replyRepository.restore({ uuid });
      if (!softRestoringReply.affected) {
        return '恢复失败';
      }
      return '恢复成功';
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(error.message, '服务器异常');
    }
  }

  /**
   * @description 为回复点赞
   * @author Saxon
   * @date 2020-03-14
   * @param {ParamDTO} replyParamDTO
   * @param {UserEntity} user
   * @returns
   * @memberof ReplyService
   */
  async like(replyParamDTO: ParamDTO, user: UserEntity) {
    const { uuid } = replyParamDTO;
    const reply = (await this.findOneByuuidForReply(
      { uuid },
      true,
    )) as ReplyEntity;
    const likeOfCurrentUser: number = reply.likes.filter(v => v.id === user.id)
      .length;

    if (!likeOfCurrentUser) {
      reply.likes.push(user);
    } else {
      reply.likes.splice(reply.likes.indexOf(user), 1);
    }
    try {
      const savingReply = await this.replyRepository.save(reply);
      return savingReply.toResponseObject();
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(error.message, '服务器异常');
    }
  }
}
