import { IArticleOutput } from '@src/article/article.interface';
import { UserStatusEnum } from './user.enum';

export interface IAccessTokenOutput {
  readonly accessToken: string;
  readonly expiresIn: string | number;
}

export interface IUserOutput {
  readonly id: string | number;
  readonly uuid?: string;
  readonly username: string;
  readonly tokenObject?: IAccessTokenOutput;
  readonly bookmarks: IArticleOutput[] | null;
  readonly bookmarksCount: number;
  readonly articles: IArticleOutput[] | null;
  readonly articlesCount: number;
  readonly likeArticles: IArticleOutput[] | null;
  readonly likeArticlesCount: number;
  readonly status?: UserStatusEnum;
  readonly createdAt?: Date;
  readonly updatedAt?: Date;
}
