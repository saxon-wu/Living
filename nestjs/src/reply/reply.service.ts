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
import { UUIDParamDTO } from '@src/shared/shared.dto';
import { CreateReplyDTO } from './reply.dto';
import { UserEntity } from '@src/user/user.entity';
import { IReplyOutput } from './reply.interface';

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
  private readonly table = 'reply';

  constructor(
    @InjectRepository(ReplyEntity)
    private readonly replyRepository: Repository<ReplyEntity>,
    private readonly commentService: CommentService,
  ) {}

  /**
   * @description 确保所有权
   * @author Saxon
   * @date 2020-03-14
   * @param {UserEntity} user
   * @param {ReplyEntity} reply
   * @memberof ReplyService
   */
  ensureOwnership(user: UserEntity, reply: ReplyEntity): void {
    if (reply.replier && (reply.replier.id as any) !== user.id) {
      throw new ForbiddenException('亲，不是您的回复无法操作');
    }
  }

  /**
   * @description 依据uuid查询一条数据，不存在则抛出404，公共调用
   * @author Saxon
   * @date 2020-03-14
   * @param {UUIDParamDTO} paramDTO
   * @param {boolean} [returnsEntity=false]
   * @returns {(Promise<ReplyEntity | IReplyOutput>)}
   * @memberof ReplyService
   */
  async findOneForReply(paramDTO: UUIDParamDTO): Promise<ReplyEntity> {
    let reply: ReplyEntity;
    const { id } = paramDTO;
    reply = await this.replyRepository.findOne(id, {
      relations: this.relations,
    });

    if (!reply) {
      throw new NotFoundException('回复不存在');
    }

    return reply;
  }

  /**
   * @description 创建回复
   * @author Saxon
   * @date 2020-03-14
   * @param {CreateReplyDTO} createReplyDTO
   * @param {UserEntity} user
   * @returns {Promise<IReplyOutput>}
   * @memberof ReplyService
   */
  async create(
    createReplyDTO: CreateReplyDTO,
    user: UserEntity,
  ): Promise<ReplyEntity> {
    const { commentId, content, replyParentId } = createReplyDTO;

    const comment = (await this.commentService.findOneForComment({
      id: commentId,
    })) as CommentEntity;

    const creating = this.replyRepository.create({ content });
    creating.comment = comment;
    creating.replier = user;
    if (replyParentId) {
      const replyParent = (await this.findOneForReply({
        id: replyParentId,
      })) as ReplyEntity;
      //   确保回复的目标也是同一条评论下的
      if (replyParent.comment && replyParent.comment.id !== comment.id) {
        throw new BadRequestException('亲，参数不正确哦');
      }
      creating.parentId = replyParent.id;
    }

    try {
      const savingReply = await this.replyRepository.save(creating);
      return savingReply;
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(error.message, '服务器异常');
    }
  }

  /**
   * @description 软删除，不检查数据库中是否存在实体
   * @author Saxon
   * @date 2020-03-14
   * @param {UUIDParamDTO} paramDTO
   * @param {UserEntity} user
   * @returns {Promise<string>}
   * @memberof ReplyService
   */
  async softDelete(paramDTO: UUIDParamDTO, user: UserEntity): Promise<string> {
    const { id } = paramDTO;
    const reply = (await this.findOneForReply(paramDTO)) as ReplyEntity;
    this.ensureOwnership(user, reply);

    try {
      const softDeletingReply = await this.replyRepository.softDelete(id);
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
   * @param {UUIDParamDTO} paramDTO
   * @param {UserEntity} user
   * @returns {Promise<string>}
   * @memberof ReplyService
   */
  async softRestore(paramDTO: UUIDParamDTO, user: UserEntity): Promise<string> {
    const { id } = paramDTO;
    const reply = (await this.findOneForReply(paramDTO)) as ReplyEntity;
    this.ensureOwnership(user, reply);

    try {
      const softRestoringReply = await this.replyRepository.restore({ id });
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
   * @param {UUIDParamDTO} paramDTO
   * @param {UserEntity} user
   * @returns {Promise<IReplyOutput>}
   * @memberof ReplyService
   */
  async like(paramDTO: UUIDParamDTO, user: UserEntity): Promise<ReplyEntity> {
    const { id } = paramDTO;
    const reply = (await this.findOneForReply({ id })) as ReplyEntity;
    const likeOfCurrentUser: number = reply.likes.filter(v => v.id === user.id)
      .length;

    if (!likeOfCurrentUser) {
      reply.likes.push(user);
      reply.likesCount = reply.likesCount + 1;
    } else {
      const index = reply.likes.findIndex(v => v.id === user.id);
      reply.likes.splice(index, 1);
      reply.likesCount = reply.likesCount - 1;
    }

    try {
      // 上面取到的comment已包含关联数据，这里save之后也保留着先前的数据，包含已修改和未修改的
      const savingReply = await this.replyRepository.save(reply);
      return savingReply;
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(error.message, '服务器异常');
    }
  }
}
