import {
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  CreateDateColumn,
  Column,
  Generated,
  DeleteDateColumn,
} from 'typeorm';
import { formatDate } from './helper.util';

export class SharedEntity {
  @PrimaryGeneratedColumn()
  public id: number;

  @Generated('uuid')
  @Column()
  public uuid: string;

  @CreateDateColumn({
    name: 'created_at',
    transformer: {
      to() {},
      from(date: Date) {
        return formatDate(date);
      },
    },
  })
  public createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    transformer: {
      to() {},
      from(date: Date) {
        return formatDate(date);
      },
    },
  })
  public updatedAt: Date;

  @DeleteDateColumn({
    name: 'deleted_at',
    transformer: {
      to() {},
      from(date: Date) {
        return formatDate(date);
      },
    },
  })
  public deletedAt: Date;
}
