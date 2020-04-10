import { IUserOutput } from '@src/user/user.interface';
import { IReplyOutput } from '@src/reply/reply.interface';

export interface ICommentOutput {
  readonly id: string | number;
  readonly uuid?: string;
  readonly content: string;
  readonly commenter: IUserOutput | null;
  readonly likes: IUserOutput[] | null;
  readonly likesCount: number;
  readonly replies: IReplyOutput[] | null;
  readonly repliesCount: number;
  readonly createdAt?: Date;
  readonly updatedAt?: Date;
}
