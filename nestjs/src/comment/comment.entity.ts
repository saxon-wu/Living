import {
  Entity,
  Column,
  ManyToOne,
  ManyToMany,
  JoinTable,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { UserEntity } from '@src/user/user.entity';
import { ArticleEntity } from '@src/article/article.entity';
import { ReplyEntity } from '@src/reply/reply.entity';
import { SharedEntity } from '@src/shared/shared.entity';

@Entity('comment')
export class CommentEntity extends SharedEntity {
  @Column({
    type: 'text',
  })
  content: string;

  /**
   * @description 评论者
   * @type {UserEntity}
   * @memberof CommentEntity
   */
  @ManyToOne(
    type => UserEntity,
    user => user.comments,
  )
  @JoinColumn({
    name: 'user_id',
  })
  commenter: UserEntity;

  /**
   * @description 评论所属的文章
   * @type {ArticleEntity}
   * @memberof CommentEntity
   */
  @ManyToOne(
    type => ArticleEntity,
    article => article.comments,
  )
  @JoinColumn({
    name: 'article_id',
  })
  article: ArticleEntity;

  /**
   * @description 评论拥有用户的(点赞)
   * @type {UserEntity[]}
   * @memberof CommentEntity
   */
  @ManyToMany(
    type => UserEntity,
    user => user.likeComments,
  )
  @JoinTable({
    joinColumn: { name: 'comment_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'user_id', referencedColumnName: 'id' },
  })
  likes: UserEntity[];

  /**
   * @description 回复的”回复“
   * @type {ReplyEntity[]}
   * @memberof CommentEntity
   */
  @OneToMany(
    type => ReplyEntity,
    reply => reply.comment,
  )
  replies: ReplyEntity[];

  /**
   * @description 返回对象
   * @author Saxon
   * @date 2020-03-13
   * @param {boolean} [isAdminSide=false]
   * @returns
   * @memberof CommentEntity
   */
  toResponseObject(isAdminSide: boolean = false) {
    const {
      id,
      uuid,
      content,
      createdAt,
      updatedAt,
      commenter,
      likes,
      replies,
    } = this;
    const common = {
      content,
      commenter: commenter?.toResponseObject() || null,
      likes: likes?.map(v => v.toResponseObject()) || null,
      likesCount: likes?.length || 0,
      replies: replies?.map(v => v.toResponseObject()) || null,
      repliesCount: replies?.length || 0,
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
