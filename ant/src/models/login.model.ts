import { stringify } from 'querystring';
import { history, Reducer, Effect } from 'umi';

import { accountLogin } from '@/services/auth.service';
import { setAuthority } from '@/utils/authority';
import { getPageQuery } from '@/utils/utils';
import { setAccessToken, getAccessToken, removeAccessToken } from '@/utils/localStorage.helper';
import request from '@/utils/request.living';

export interface StateType {
  status?: 'ok' | 'error';
  type?: string;
  currentAuthority?: 'user' | 'guest' | 'admin';
}

export interface LoginModelType {
  namespace: 'LoginModel';
  state: StateType;
  effects: {
    login: Effect;
    logout: Effect;
  };
  reducers: {
    changeLoginStatus: Reducer<StateType>;
  };
}

const Model: LoginModelType = {
  namespace: 'LoginModel',

  state: {
    status: undefined,
  },

  effects: {
    *login({ payload }, { call, put }) {
      const response = yield call(accountLogin, payload);
      yield put({
        type: 'changeLoginStatus',
        payload: response,
      });
      // Login successfully
      if (response.statusCode === 0) {
        setAccessToken(response.result.accessToken);
        const urlParams = new URL(window.location.href);
        const params = getPageQuery();
        let { redirect } = params as { redirect: string };
        if (getAccessToken()) {
          request.extendOptions({
            headers: {
              Authorization: `Bearer ${getAccessToken()}`,
            },
          });
        }
        if (redirect) {
          const redirectUrlParams = new URL(redirect);
          if (redirectUrlParams.origin === urlParams.origin) {
            redirect = redirect.substr(urlParams.origin.length);
            if (redirect.match(/^\/.*#/)) {
              redirect = redirect.substr(redirect.indexOf('#') + 1);
            }
          } else {
            window.location.href = '/';
            return;
          }
        }
        
        history.replace(redirect || '/');
      }
    },

    logout() {
      removeAccessToken()
      window.location.replace('/auth/login')
      // const { redirect } = getPageQuery();
      // Note: There may be security issues, please note
      // if (window.location.pathname !== '/auth/login' && !redirect) {
      //   history.replace({
      //     pathname: '/auth/login',
      //     search: stringify({
      //       redirect: window.location.href,
      //     }),
      //   });
      // }
    },
  },

  reducers: {
    changeLoginStatus(state, { payload }) {
      setAuthority(payload.currentAuthority);
      return {
        ...state,
        status: payload.status,
        type: payload.type,
      };
    },
  },
};

export default Model;
