import { Entity, Column, ManyToOne, JoinColumn, AfterLoad } from 'typeorm';
import { UserEntity } from 'src/user/user.entity';
import { SharedEntity } from '@src/shared/shared.entity';
import { FileStatusEnum } from './file.enum';
import { filenameToUrl } from '@src/shared/helper.util';

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

  url: string;

  @AfterLoad()
  convertToUrl() {
    this.url = filenameToUrl(this.filename);
  }
}
