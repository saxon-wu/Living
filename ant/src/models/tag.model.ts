import {
  queryTagsService,
  updateTagService,
  createTagService,
  deleteTagService,
} from '@/services/tag.service';
import { Effect, Reducer } from 'umi';
import { message } from 'antd';
import { ITag } from '@/pages/tag/data';

export interface ITagModelState {
  tags?: ITag[];
}

export interface ITagModel {
  namespace: 'TagModel';
  state: ITagModelState;
  effects: {
    fetchTagsModel: Effect;
    createTagModel: Effect;
    updateTagModel: Effect;
    deleteTagModel: Effect;
  };
  reducers: {
    saveTags: Reducer<ITagModelState>;
  };
}

const TagModel: ITagModel = {
  namespace: 'TagModel',
  state: {},
  effects: {
    *fetchTagsModel(_, { call, put }) {
      const response = yield call(queryTagsService);
      yield put({
        type: 'saveTags',
        payload: response?.result,
      });
    },
    *createTagModel({ payload, callback }, { call, put }) {
      const hide = message.loading('创建中...');
      const response = yield call(createTagService, payload);
      hide();
      if (response.statusCode === 0) {
        message.success('创建成功，即将刷新');
      }
      // let notificationType: string = 'success';
      // console.log(response);

      // if (response.statusCode !== 0) {
      //   notificationType = 'error';
      // }
      if (callback && typeof callback === 'function') {
        callback(response);
      }
      // notification[notificationType]({
      //   message: response.message,
      // });
    },
    *updateTagModel({ payload, callback }, { call, put }) {
      const hide = message.loading('更新中...');
      const response = yield call(updateTagService, payload);
      hide();
      if (response.statusCode === 0) {
        message.success('创建成功，即将刷新');
      }
      if (callback && typeof callback === 'function') {
        callback(response);
      }
    },
    *deleteTagModel({ payload, callback }, { call, put }) {
      const hide = message.loading('删除中...');
      const response = yield call(deleteTagService, payload);
      hide();
      if (response.statusCode === 0) {
        message.success('创建成功，即将刷新');
      }
      if (callback && typeof callback === 'function') {
        callback(response);
      }
    },
  },
  reducers: {
    saveTags(state, action) {
      return {
        ...state,
        tags: action.payload || {},
      };
    },
  },
};

export default TagModel;
