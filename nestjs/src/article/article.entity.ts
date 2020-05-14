import {
  Entity,
  Column,
  ManyToOne,
  ManyToMany,
  JoinColumn,
  JoinTable,
  OneToMany,
  RelationCount,
  OneToOne,
  Index,
} from 'typeorm';
import { IsNotEmpty, IsString } from 'class-validator';
import { UserEntity } from '@src/user/user.entity';
import { CommentEntity } from '@src/comment/comment.entity';
import { SharedEntity } from '@src/shared/shared.entity';
import { ArticleStatusEnum } from './article.enum';
import { IArticleOutput, IContent } from './article.interface';
import { TagEntity } from '@src/tag/tag.entity';
import { FileEntity } from '@src/file/file.entity';

@Entity('article')
export class ArticleEntity extends SharedEntity {
  @IsNotEmpty()
  @IsString()
  @Column()
  title: string;

  @IsNotEmpty()
  @IsString()
  @Column({
    type: 'json',
  })
  content: IContent;

  @Column({
    type: 'enum',
    enum: ArticleStatusEnum,
    default: ArticleStatusEnum.NORMAL,
  })
  status: ArticleStatusEnum;

  @OneToOne(type => FileEntity)
  @JoinColumn()
  cover: FileEntity;

  @Column({
    type: 'boolean',
    name: 'is_public',
    default: true,
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

  @RelationCount((articleEntity: ArticleEntity) => articleEntity.likes)
  likesCount: number;

  /**
   * @description 文章属于用户(收藏)
   * @type {UserEntity[]}
   * @memberof ArticleEntity
   */
  @ManyToMany(
    type => UserEntity,
    user => user.favorites,
  )
  favoriteUsers: UserEntity[];

  @RelationCount((articleEntity: ArticleEntity) => articleEntity.favoriteUsers)
  favoriteUsersCount: number;
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

  @RelationCount((articleEntity: ArticleEntity) => articleEntity.comments)
  commentsCount: number;

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

  isOwnership: boolean = false;
}
