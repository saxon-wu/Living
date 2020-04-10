import { IUserOutput } from '@src/user/user.interface';
import { ArticleStatusEnum } from './article.enum';

export interface IArticleOutput {
  readonly id: string | number;
  readonly uuid?: string;
  readonly title: string;
  readonly content: string;
  readonly publisher: IUserOutput | null;
  readonly likes: IUserOutput[] | null;
  readonly likesCount: number;
  readonly bookmarkUsers: IUserOutput[] | null;
  readonly bookmarkUsersCount: number;
  readonly status?: ArticleStatusEnum;
  readonly createdAt?: Date;
  readonly updatedAt?: Date;
}
