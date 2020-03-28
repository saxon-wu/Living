import {
  Entity,
  ManyToOne,
  Column,
  ManyToMany,
  JoinTable,
  JoinColumn,
} from 'typeorm';
import { CommentEntity } from '@src/comment/comment.entity';
import { UserEntity } from '@src/user/user.entity';
import { SharedEntity } from '@src/shared/shared.entity';

@Entity('reply')
export class ReplyEntity extends SharedEntity {
  @Column({
    type: 'text',
  })
  content: string;

  /**
   * @description 回复者
   * @type {UserEntity}
   * @memberof ReplyEntity
   */
  @ManyToOne(
    type => UserEntity,
    user => user.comments,
  )
  @JoinColumn({
    name: 'user_id',
  })
  replier: UserEntity;

  /**
   * @description 回复拥有用户的(点赞)
   * @type {UserEntity[]}
   * @memberof ReplyEntity
   */
  @ManyToMany(
    type => UserEntity,
    user => user.likeComments,
  )
  @JoinTable({
    joinColumn: { name: 'reply_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'user_id', referencedColumnName: 'id' },
  })
  likes: UserEntity[];

  /**
   * @description 回复所属的评论
   * @type {CommentEntity}
   * @memberof ReplyEntity
   */
  @ManyToOne(
    type => CommentEntity,
    comment => comment.replies,
  )
  @JoinColumn({
    name: 'comment_id',
  })
  comment: CommentEntity;

  /**
   * @description 回复哪一条“回复”
   * @type {number}
   * @memberof ReplyEntity
   */
  @Column({
    name: 'parent_id',
    default: 0,
  })
  parentId: number;

  /**
   * @description 返回对象
   * @author Saxon
   * @date 2020-03-13
   * @param {boolean} [isAdminSide=false]
   * @returns
   * @memberof ReplyEntity
   */
  toResponseObject(isAdminSide: boolean = false) {
    const { id, uuid, createdAt, updatedAt, replier, likes, content } = this;
    const common = {
      content,
      replier: replier?.toResponseObject() || null,
      likes: likes?.map(v => v.toResponseObject()) || null,
      likesCount: likes?.length || 0,
    };
    if (isAdminSide) {
      return {
        id,
        uuid,
        createdAt,
        updatedAt,
        ...common,
      };
    }
    return { id: uuid, ...common };
  }
}
