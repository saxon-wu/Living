import {
  Entity,
  PrimaryGeneratedColumn,
  Generated,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
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

  @ManyToOne(
    tyep => UserEntity,
    user => user.articles,
    { onDelete: 'CASCADE' },
  )
  user: UserEntity;

  /**
   * @description 返回对象
   * @author Saxon
   * @date 2020-03-11
   * @param {boolean} [isAdminSide=false]
   * @returns
   * @memberof ArticleEntity
   */
  toResponseObject(isAdminSide: boolean = false) {
    const { id, uuid, title, content, createdAt, updateAt, user } = this;
    const common = { title, content, user: user?.toResponseObject() || null };
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
