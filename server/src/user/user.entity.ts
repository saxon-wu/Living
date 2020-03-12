import {
  Entity,
  PrimaryGeneratedColumn,
  Generated,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert,
  OneToMany,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { IsNotEmpty, IsString } from 'class-validator';
import { Exclude } from 'class-transformer';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { ArticleEntity } from 'src/article/article.entity';

interface ITokenResponseObject {
  readonly accessToken: string;
  readonly expiresIn: string | number;
}

@Entity('user')
export class UserEntity {
  constructor(partial: Partial<UserEntity>) {
    Object.assign(this, partial);
  }

  @PrimaryGeneratedColumn()
  id: number;

  @Generated('uuid')
  @Column()
  uuid: string;

  @IsNotEmpty()
  @IsString()
  @Column({
    unique: true,
  })
  username: string;

  @Exclude()
  @Column({
    type: 'varchar',
    length: 60,
    nullable: true,
  })
  password: string;

  @CreateDateColumn({
    name: 'created_at',
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
  })
  updatedAt: Date;

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

  /**
   * @description 用户自己收藏哪些文章
   * @type {ArticleEntity[]}
   * @memberof UserEntity
   */
  @ManyToMany(
    type => ArticleEntity,
    user => user.bookmarkUsers,
    { cascade: true },
  )
  @JoinTable({
    joinColumn: { name: 'user_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'article_id', referencedColumnName: 'id' },
  })
  bookmarks: ArticleEntity[];

  /**
   * @description 用户自己点赞过的文章
   * @type {ArticleEntity[]}
   * @memberof UserEntity
   */
  @ManyToMany(
    type => ArticleEntity,
    user => user.likes,
  )
  likeArticles: ArticleEntity[];

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
    return bcrypt.compareSync(password, this.password);
  }

  /**
   * @description 创建token
   * @readonly
   * @private
   * @type {ITokenResponseObject}
   * @memberof UserEntity
   */
  private get tokenObject(): ITokenResponseObject {
    const { uuid, username } = this;
    // JWT_EXPIRATION_IN环境变量取到的是字符串，Eg: '60', "2 days", "10h", "7d", 其中字符串中是纯数字必须转成number类型，否则会报token过期
    let expiresIn: number | string = process.env.JWT_EXPIRATION_IN;
    if (!Number.isNaN(Number(expiresIn))) {
      // expiresIn转成数字类型不是not a number，说时可以转为数字类型，则转为数字类型
      expiresIn = Number.parseInt(expiresIn, 10);
    }
    const accessToken: string = jwt.sign(
      { id: uuid, username },
      process.env.JWT_SECRET_KEY,
      {
        expiresIn,
      },
    );
    return { accessToken, expiresIn };
  }

  /**
   * @description 返回对象
   * @author Saxon
   * @date 2020-03-11
   * @param {boolean} [isAdminSide=false]
   * @param {boolean} [showToken=false]
   * @returns
   * @memberof UserEntity
   */
  toResponseObject(isAdminSide: boolean = false, showToken: boolean = false) {
    const {
      id,
      uuid,
      username,
      createdAt,
      updatedAt,
      articles,
      bookmarks,
      likeArticles,
      tokenObject,
    } = this;
    const common = {
      username,
      bookmarks: bookmarks?.map(v => v.toResponseObject()),
      bookmarksTotal: bookmarks?.length,
      articles: articles?.map(v => v.toResponseObject()),
      articlesTotal: articles?.length,
      likeArticles: likeArticles?.map(v => v.toResponseObject()),
      likeArticlesTotal: likeArticles?.length,
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
    const client = { id: uuid, ...common };
    if (showToken) {
      return { ...client, ...tokenObject };
    }
    return client;
  }
}
