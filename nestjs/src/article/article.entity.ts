import {
  Entity,
  Column,
  ManyToOne,
  ManyToMany,
  JoinColumn,
  JoinTable,
  OneToMany,
} from 'typeorm';
import { IsNotEmpty, IsString } from 'class-validator';
import { UserEntity } from '@src/user/user.entity';
import { CommentEntity } from '@src/comment/comment.entity';
import { SharedEntity } from '@src/shared/shared.entity';
import { ArticleStatusEnum } from './article.enum';
import { IArticleOutput } from './article.interface';
import { TagEntity } from '@src/tag/tag.entity';

@Entity('article')
export class ArticleEntity extends SharedEntity {
  @IsNotEmpty()
  @IsString()
  @Column()
  title: string;

  @IsNotEmpty()
  @IsString()
  @Column({
    type: 'text',
  })
  content: string;

  @Column({
    type: 'enum',
    enum: ArticleStatusEnum,
    default: ArticleStatusEnum.NORMAL,
  })
  status: ArticleStatusEnum;

  @Column({
    type: 'boolean',
    name: 'is_public',
    default: false,
    comment: '文章是否公开，即是不是草稿',
  })
  isPublic: boolean;

  /**
   * @description 发布者
   * @type {UserEntity}
   * @memberof ArticleEntity
   */
  @ManyToOne(
    tyep => UserEntity,
    user => user.articles,
  )
  @JoinColumn({
    name: 'user_id',
  })
  publisher: UserEntity;

  /**
   * @description 文章拥有用户的(点赞)
   * @type {UserEntity[]}
   * @memberof ArticleEntity
   */
  @ManyToMany(
    type => UserEntity,
    user => user.likeArticles,
  )
  @JoinTable({
    joinColumn: { name: 'article_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'user_id', referencedColumnName: 'id' },
  })
  likes: UserEntity[];

  /**
   * @description 文章属于用户(收藏)
   * @type {UserEntity[]}
   * @memberof ArticleEntity
   */
  @ManyToMany(
    type => UserEntity,
    user => user.bookmarks,
  )
  bookmarkUsers: UserEntity[];

  /**
   * @description 文章的评论
   * @type {CommentEntity[]}
   * @memberof ArticleEntity
   */
  @OneToMany(
    type => CommentEntity,
    comment => comment.article,
  )
  comments: CommentEntity[];

  /**
   * @description 文章属于标签
   * @type {TagEntity[]}
   * @memberof ArticleEntity
   */
  @ManyToMany(
    type => TagEntity,
    tag => tag.articles,
  )
  tags: TagEntity[];

  /**
   * @description 返回对象
   * @author Saxon
   * @date 2020-03-11
   * @param {boolean} [isAdminSide=false]
   * @returns
   * @memberof ArticleEntity
   */
  toResponseObject(isAdminSide: boolean = false): IArticleOutput {
    const {
      id,
      uuid,
      title,
      content,
      createdAt,
      updatedAt,
      publisher,
      likes,
      bookmarkUsers,
      status,
    } = this;
    const common = {
      title,
      content,
      publisher: publisher?.toResponseObject() || null,
      likes: likes?.map(v => v.toResponseObject()) || null,
      likesCount: likes?.length || 0,
      bookmarkUsers: bookmarkUsers?.map(v => v.toResponseObject()) || null,
      bookmarkUsersCount: bookmarkUsers?.length || 0,
    };
    if (isAdminSide) {
      return {
        id,
        uuid,
        status,
        createdAt,
        updatedAt,
        ...common,
      };
    }
    return { id: uuid, ...common };
  }
}
