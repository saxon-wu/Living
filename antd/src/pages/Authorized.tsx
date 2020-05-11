import React from 'react';
import { Redirect, connect, ConnectProps } from 'umi';
import Authorized from '@/utils/Authorized';
import { getRouteAuthority } from '@/utils/utils';
import { IConnectState, IUserModelState } from '@/models/connect';

interface AuthComponentProps extends ConnectProps {
  user: IUserModelState;
}

const AuthComponent: React.FC<AuthComponentProps> = ({
  children,
  route = {
    routes: [],
  },
  location = {
    pathname: '',
  },
  user,
}) => {
  const { currentUser } = user;
  const { routes = [] } = route;
  const isLogin = currentUser && currentUser.username;
  return (
    <Authorized
      authority={getRouteAuthority(location.pathname, routes) || ''}
      noMatch={isLogin ? <Redirect to="/exception/403" /> : <Redirect to="/auth/login" />}
    >
      {children}
    </Authorized>
  );
};

export default connect(({ UserModel }: IConnectState) => ({
  UserModel,
}))(AuthComponent);
