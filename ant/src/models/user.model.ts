import { queryUsersService, updateUserService, queryWhoamiService } from '@/services/user.service';
import { Effect, Reducer } from 'umi';
import { notification } from 'antd';
import { IUser } from '@/pages/user/data.d';

export interface IUserModelState {
  users?: IUser[];
  currentUser?: IUser;
}

export interface IUserModel {
  namespace: 'UserModel';
  state: IUserModelState;
  effects: {
    fetchCurrent: Effect;
    fetchUsersModel: Effect;
    updateUserModel: Effect;
  };
  reducers: {
    saveCurrentUser: Reducer<IUserModelState>;
    saveUsers: Reducer<IUserModelState>;
  };
}

const UserModel: IUserModel = {
  namespace: 'UserModel',
  state: {},
  effects: {
    *fetchCurrent(_, { call, put }) {
      const response = yield call(queryWhoamiService);
      yield put({
        type: 'saveCurrentUser',
        payload: response?.results,
      });
    },
    *fetchUsersModel(_, { call, put }) {
      const response = yield call(queryUsersService);
      yield put({
        type: 'saveUsers',
        payload: response?.results,
      });
    },
    *updateUserModel({ payload, callback }, { call, put }) {
      const response = yield call(updateUserService, payload);
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
    saveCurrentUser(state, action) {
      return {
        ...state,
        currentUser: action.payload || {},
      };
    },
    saveUsers(state, action) {
      return {
        ...state,
        users: action.payload || {},
      };
    },
  },
};

export default UserModel;
