import { MenuDataItem } from '@ant-design/pro-layout';
import { IGlobalModelState } from './global.model';
import { IDefaultSettings as ISettingModelState } from '../../config/defaultSettings';
import { IUserModelState } from './user.model';
import { StateType } from './login.model';

export { IGlobalModelState, ISettingModelState, IUserModelState };

export interface ILoading {
  global: boolean;
  effects: { [key: string]: boolean | undefined };
  models: {
    GlobalModel?: boolean;
    menu?: boolean;
    SettingModel?: boolean;
    UserModel?: boolean;
    LoginModel?: boolean;
  };
}

export interface IConnectState {
  GlobalModel: IGlobalModelState;
  loading: ILoading;
  SettingModel: ISettingModelState;
  UserModel: IUserModelState;
  LoginModel: StateType;
}

export interface Route extends MenuDataItem {
  routes?: Route[];
}
