import { IArticle } from '../article/data';
import { IUser } from '../user/data';

export interface ITag {
  id: number;
  name: string;
  describe: string;
  creator: IUser;
  updatedAt: Date;
  createdAt: Date;
  articles: IArticle;
  parentId?: number;
}

export interface IUpdateTag {
  name: string;
  describe: string;
  parentId: number;
  // creator: IUser;
  // articles: IArticle;
}

export interface ICreateTag {
  name: string;
  describe: string;
  parentId: number;
  // creator: IUser;
  // articles: IArticle;
}
