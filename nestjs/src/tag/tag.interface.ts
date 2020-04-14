import { IArticleOutput } from '@src/article/article.interface';
import { IUserOutput } from '@src/user/user.interface';
import { TagEntity } from './tag.entity';

export interface ITagOutput {
  readonly id: string | number;
  readonly uuid?: string;
  readonly name: string;
  readonly describe: string;
  readonly creator: IUserOutput | null;
  readonly articles: IArticleOutput[] | null;
  readonly articlesCount: number;
  readonly createdAt?: Date;
  readonly updatedAt?: Date;
  readonly children?: TagEntity[];
}
