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
} from 'typeorm';
import { IsNotEmpty, IsString } from 'class-validator';
import { UserEntity } from 'src/user/user.entity';

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

  /**
   * @description 该文章的发布者
   * @type {UserEntity}
   * @memberof ArticleEntity
   */
  @ManyToOne(
    tyep => UserEntity,
    publisher => publisher.articles,
    { onDelete: 'CASCADE' },
  )
  @JoinColumn({
    name: 'user_id',
  })
  publisher: UserEntity;

  /**
   * @description 文章拥有哪些用户的点赞
   * @type {UserEntity[]}
   * @memberof ArticleEntity
   */
  @ManyToMany(
    type => UserEntity,
    article => article.likeArticles,
    { cascade: true },
  )
  @JoinTable({
    joinColumn: { name: 'article_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'user_id', referencedColumnName: 'id' },
  })
  likes: UserEntity[];

  /**
   * @description 文章被哪些用户收藏
   * @type {UserEntity[]}
   * @memberof ArticleEntity
   */
  @ManyToMany(
    type => UserEntity,
    article => article.bookmarks,
  )
  bookmarkUsers: UserEntity[];

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
      publisher: publisher?.toResponseObject(),
      likes: likes?.map(v => v.toResponseObject()),
      likesTotal: likes?.length,
      bookmarkUsers: bookmarkUsers?.map(v => v.toResponseObject()),
      bookmarkUsersTotal: bookmarkUsers?.length,
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
