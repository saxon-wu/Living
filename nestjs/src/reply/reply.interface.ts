import { IUserOutput } from '@src/user/user.interface';

export interface IReplyOutput {
  readonly id: string | number;
  readonly uuid?: string;
  readonly content: string;
  readonly replier: IUserOutput | null;
  readonly likes: IUserOutput[] | null;
  readonly likesCount: number;
  readonly createdAt?: Date;
  readonly updatedAt?: Date;
}
