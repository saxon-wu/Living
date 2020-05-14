import { IUserOutput } from '@src/user/user.interface';
import { ArticleStatusEnum } from './article.enum';
import { IFileOutput } from '@src/file/file.interface';

export interface IContent {
  /**
   * Editor's version
   */
  version: string;

  /**
   * Timestamp of saving in milliseconds
   */
  time: number;

  /**
   * Saved Blocks
   */
  blocks: Array<{
    type: string;
    data: object
  }>;
}

export interface IArticleOutput {
  readonly id: string | number;
  readonly uuid?: string;
  readonly title: string;
  readonly content: IContent;
  readonly cover: IFileOutput;
  readonly publisher: IUserOutput | null;
  readonly likes: IUserOutput[] | null;
  readonly likesCount: number;
  readonly favoriteUsers: IUserOutput[] | null;
  readonly favoriteUsersCount: number;
  readonly status?: ArticleStatusEnum;
  readonly createdAt?: Date;
  readonly updatedAt?: Date;
}
