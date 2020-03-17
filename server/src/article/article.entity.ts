import {
  Entity,
  PrimaryGeneratedColumn,
  Generated,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  ManyToMany,
  JoinColumn,
  JoinTable,
  OneToMany,
  DeleteDateColumn,
} from 'typeorm';
import { IsNotEmpty, IsString } from 'class-validator';
import { UserEntity } from '@src/user/user.entity';
import { CommentEntity } from '@src/comment/comment.entity';

@Entity('article')
export class ArticleEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Generated('uuid')
  @Column()
  uuid: string;

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

  @CreateDateColumn({
    name: 'created_at',
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
  })
  updateAt: Date;

  @DeleteDateColumn({
    name: 'deleted_at',
  })
  deletedAt: Date;

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
   * @description 返回对象
   * @author Saxon
   * @date 2020-03-11
   * @param {boolean} [isAdminSide=false]
   * @returns
   * @memberof ArticleEntity
   */
  toResponseObject(isAdminSide: boolean = false) {
    const {
      id,
      uuid,
      title,
      content,
      createdAt,
      updateAt,
      publisher,
      likes,
      bookmarkUsers,
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
        createdAt,
        updateAt,
        ...common,
      };
    }
    return { id: uuid, ...common };
  }
}
