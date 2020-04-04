export interface IArticle {
  id: number;
  title: string;
  likesCount: number;
  bookmarkArticlesCount: number;
  status: string;
  publisher: string;
  createdAt: Date;
}

export enum ArticleStatusEnum {
  NORMAL = 'Normal',
  DISABLED = 'Disabled',
}

const ArticleStatusReference = {
  Normal: { text: '正常', color: 'green', status: 'Processing' },
  Disabled: { text: '禁用', color: 'orange', status: 'Warning' },
};
export { ArticleStatusReference };

export interface IUpdateArticle {
  status: ArticleStatusEnum;
}
