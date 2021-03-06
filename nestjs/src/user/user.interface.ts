import { IArticleOutput } from '@src/article/article.interface';
import { UserStatusEnum } from './user.enum';
import { IFileOutput } from '@src/file/file.interface';

export interface IAccessTokenOutput {
  readonly accessToken: string;
  readonly expiresIn: string | number;
}

export interface IUserOutput {
  readonly id: string | number;
  readonly uuid?: string;
  readonly username: string;
  readonly tokenObject?: IAccessTokenOutput;
  readonly favorites: IArticleOutput[] | null;
  readonly favoritesCount: number;
  readonly articles: IArticleOutput[] | null;
  readonly articlesCount: number;
  readonly likeArticles: IArticleOutput[] | null;
  readonly likeArticlesCount: number;
  readonly status?: UserStatusEnum;
  readonly createdAt?: Date;
  readonly updatedAt?: Date;
  readonly avatar: IFileOutput | { url: string };
}
