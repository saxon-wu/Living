import {
  Entity,
  Column,
  BeforeInsert,
  OneToMany,
  ManyToMany,
  JoinTable,
  OneToOne,
  JoinColumn,
  RelationCount,
  AfterLoad,
} from 'typeorm';
import { IsNotEmpty, IsString } from 'class-validator';
import { Exclude } from 'class-transformer';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { ArticleEntity } from '@src/article/article.entity';
import { CommentEntity } from '@src/comment/comment.entity';
import { SharedEntity } from '@src/shared/shared.entity';
import { IAccessTokenOutput, IUserOutput } from '@src/user/user.interface';
import { UserStatusEnum } from './user.enum';
import { FileEntity } from '@src/file/file.entity';

@Entity('user')
export class UserEntity extends SharedEntity {
  constructor(partial: Partial<UserEntity>) {
    super();
    Object.assign(this, partial);
  }

  @IsNotEmpty()
  @IsString()
  @Column({
    unique: true,
  })
  username: string;

  @Exclude({ toPlainOnly: true })
  @Column({
    type: 'varchar',
    length: 60,
    nullable: true,
  })
  password: string;

  @OneToOne(type => FileEntity)
  @JoinColumn()
  avatar: FileEntity;

  @Column({
    type: 'enum',
    enum: UserStatusEnum,
    default: UserStatusEnum.NORMAL,
    comment: '封号: 不可登录',
  })
  status: UserStatusEnum;

  /**
   * @description 用户发布的文章
   * @type {ArticleEntity[]}
   * @memberof UserEntity
   */
  @OneToMany(
    type => ArticleEntity,
    article => article.publisher,
  )
  articles: ArticleEntity[];

  @RelationCount((userEntity: UserEntity) => userEntity.articles)
  articlesCount: number;

  /**
   * @description 用户拥有收藏的(文章)
   * @type {ArticleEntity[]}
   * @memberof UserEntity
   */
  @ManyToMany(
    type => ArticleEntity,
    article => article.favoriteUsers,
  )
  @JoinTable({
    joinColumn: { name: 'user_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'article_id', referencedColumnName: 'id' },
  })
  favorites: ArticleEntity[];

  @RelationCount((userEntity: UserEntity) => userEntity.favorites)
  favoritesCount: number;

  /**
   * @description 用户属于点赞的(文章)
   * @type {ArticleEntity[]}
   * @memberof UserEntity
   */
  @ManyToMany(
    type => ArticleEntity,
    article => article.likes,
  )
  likeArticles: ArticleEntity[];

  @RelationCount((userEntity: UserEntity) => userEntity.likeArticles)
  likeArticlesCount: number;

  /**
   * @description 用户发表的评论
   * @type {CommentEntity[]}
   * @memberof UserEntity
   */
  @OneToMany(
    type => CommentEntity,
    comment => comment.commenter,
  )
  comments: CommentEntity[];

  /**
   * @description 用户属于点赞的(评论)
   * @type {ArticleEntity[]}
   * @memberof UserEntity
   */
  @ManyToMany(
    type => ArticleEntity,
    comment => comment.likes,
  )
  likeComments: ArticleEntity[];

  @OneToMany(
    type => FileEntity,
    file => file.uploader,
  )
  files: FileEntity[];

  /**
   * @description 插入之前把密码哈希
   * @author Saxon
   * @date 2020-03-11
   * @memberof UserEntity
   */
  @BeforeInsert()
  hashPassword() {
    this.password = bcrypt.hashSync(this.password, 10);
  }

  /**
   * @description 比较密码
   * @author Saxon
   * @date 2020-03-11
   * @param {string} password
   * @returns {boolean}
   * @memberof UserEntity
   */
  comparePassword(password: string): boolean {
    return this.password ? bcrypt.compareSync(password, this.password) : false;
  }

  /**
   * @description 创建token
   * @readonly
   * @private
   * @type {IAccessTokenOutput}
   * @memberof UserEntity
   */
  get tokenObject(): IAccessTokenOutput {
    const { id, username } = this;
    // JWT_EXPIRATION_IN环境变量取到的是字符串，Eg: '60', "2 days", "10h", "7d", 其中字符串中是纯数字必须转成number类型，否则会报token过期
    let expiresIn: number | string = process.env.JWT_EXPIRATION_IN;
    if (!Number.isNaN(Number(expiresIn))) {
      // expiresIn转成数字类型不是not a number，说时可以转为数字类型，则转为数字类型
      expiresIn = Number.parseInt(expiresIn, 10);
    }
    const accessToken: string = jwt.sign(
      { id, username },
      process.env.JWT_SECRET_KEY,
      {
        expiresIn,
      },
    );
    return { accessToken, expiresIn };
  }
}
