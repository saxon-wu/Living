import {
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  CreateDateColumn,
  Column,
  Generated,
  DeleteDateColumn,
} from 'typeorm';
import * as dayjs from 'dayjs';

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
        return dayjs(date).format('YYYY-MM-DD HH:mm:ss');
      },
    },
  })
  public createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    transformer: {
      to() {},
      from(date: Date) {
        return dayjs(date).format('YYYY-MM-DD HH:mm:ss');
      },
    },
  })
  public updatedAt: Date;

  @DeleteDateColumn({
    name: 'deleted_at',
    transformer: {
      to() {},
      from(date: Date) {
        return dayjs(date).format('YYYY-MM-DD HH:mm:ss');
      },
    },
  })
  public deletedAt: Date;
}
