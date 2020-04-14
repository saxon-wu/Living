import {
  Entity,
  ManyToOne,
  Column,
  ManyToMany,
  JoinTable,
  JoinColumn,
} from 'typeorm';
import { SharedEntity } from '@src/shared/shared.entity';
import { UserEntity } from '@src/user/user.entity';
import { ArticleEntity } from '@src/article/article.entity';
import { ITagOutput } from './tag.interface';

@Entity('tag')
export class TagEntity extends SharedEntity {
  @Column({
    unique: true,
  })
  name: string;

  @Column()
  describe: string;

  @Column({
    name: 'parent_id',
    default: 0,
  })
  parentId: number;

  /**
   * @description 创建者
   * @type {UserEntity}
   * @memberof TagEntity
   */
  @ManyToOne(
    type => UserEntity,
    // user => user.tags,
  )
  @JoinColumn({
    name: 'user_id',
  })
  creator: UserEntity;

  /**
   * @description 标签拥有文章
   * @type {ArticleEntity[]}
   * @memberof TagEntity
   */
  @ManyToMany(
    type => ArticleEntity,
    article => article.tags,
  )
  @JoinTable({
    joinColumn: { name: 'tag_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'article_id', referencedColumnName: 'id' },
  })
  articles: ArticleEntity[];

  /**
   * @description 不是数据库中的列。
   * 调用toResponseObject方法的对象是一个必须是TagEntity类型，而TagEntity中没有children对象不是TagEntity类型，故无法调用，所以加些类型
   * @type {TagEntity[]}
   * @memberof TagEntity
   */
  children: TagEntity[];

  toResponseObject(isAdminSide: boolean = false): ITagOutput {
    const {
      id,
      uuid,
      createdAt,
      updatedAt,
      name,
      describe,
      creator,
      articles,
      children,
      parentId
    } = this;
    const common = {
      name,
      describe,
      creator: creator?.toResponseObject() || null,
      articles: articles?.map(v => v.toResponseObject()),
      articlesCount: articles?.length,
      children,
      parentId
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
