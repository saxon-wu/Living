import { queryArticlesService, updateArticleService } from '@/services/article.service';
import { Effect, Reducer } from 'umi';
import { notification } from 'antd';
import { IArticle } from '@/pages/article/data';

export interface IArticleModelState {
  articles?: IArticle[];
}

export interface IArticleModel {
  namespace: 'ArticleModel';
  state: IArticleModelState;
  effects: {
    fetchArticlesModel: Effect;
    updateArticleModel: Effect;
  };
  reducers: {
    saveArticles: Reducer<IArticleModelState>;
  };
}

const ArticleModel: IArticleModel = {
  namespace: 'ArticleModel',
  state: {},
  effects: {
    *fetchArticlesModel(_, { call, put }) {
      const response = yield call(queryArticlesService);
      yield put({
        type: 'saveArticles',
        payload: response?.results,
      });
    },
    *updateArticleModel({ payload, callback }, { call, put }) {
      const response = yield call(updateArticleService, payload);
      let notificationType: string = 'success';
      if (response.statusCode !== 0) {
        notificationType = 'error';
      }
      if (callback && typeof callback === 'function') {
        callback(response);
      }
      notification[notificationType]({
        message: response.message,
      });
    },
  },
  reducers: {
    saveArticles(state, action) {
      return {
        ...state,
        articles: action.payload || {},
      };
    },
  },
};

export default ArticleModel;
