import { IUserOutput } from '@src/user/user.interface';
import { FileStatusEnum } from './file.enum';

export interface IFileOutput {
  readonly id: string | number;
  readonly uuid?: string;
  readonly filename: string;
  readonly originalname: string;
  readonly mimetype: string;
  readonly size: number;
  readonly uploader: IUserOutput | null;
  readonly status?: FileStatusEnum;
  readonly createdAt?: Date;
  readonly updatedAt?: Date;
  readonly url: string;
}

export interface IFileProperty {
  readonly filename: string;
  readonly originalname: string;
  readonly size: number;
  readonly mimetype: string;
}
