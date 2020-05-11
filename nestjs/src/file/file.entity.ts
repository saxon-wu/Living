import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { UserEntity } from 'src/user/user.entity';
import { SharedEntity } from '@src/shared/shared.entity';
import { FileStatusEnum } from './file.enum';
import { IFileOutput } from './file.interface';

@Entity('file')
export class FileEntity extends SharedEntity {
  static get modelName(): string {
    return this.name;
  }

  @Column({
    type: 'enum',
    enum: FileStatusEnum,
    default: FileStatusEnum.NORMAL,
  })
  status: FileStatusEnum;

  @Column()
  filename: string;

  @Column()
  originalname: string;

  @Column()
  mimetype: string;

  @Column()
  size: number;

  @ManyToOne(
    type => UserEntity,
    user => user.files,
  )
  @JoinColumn({
    name: 'user_id',
  })
  uploader: UserEntity;

  /**
   * @description 返回对象
   * @author Saxon
   * @date 2020-04-28
   * @param {boolean} [isAdminSide=false]
   * @returns {IFileOutput}
   * @memberof FileEntity
   */
  toResponseObject(isAdminSide: boolean = false): IFileOutput {
    const {
      id,
      uuid,
      createdAt,
      updatedAt,
      filename,
      originalname,
      mimetype,
      size,
      status,
      uploader,
    } = this;
    const common = {
      createdAt,
      filename,
      originalname,
      mimetype,
      size,
      url: `${process.env.APP_URL_PREFIX}${
        process.env.APP_PORT === '80' ? '' : `:${process.env.APP_PORT}`
      }/api/v1/file/image/${filename}`,
      uploader: uploader?.toResponseObject() || null,
    };
    if (isAdminSide) {
      return {
        id,
        uuid,
        status,
        updatedAt,
        ...common,
      };
    }
    return { id: uuid, ...common };
  }
}
