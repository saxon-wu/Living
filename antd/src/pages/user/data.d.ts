export interface IUser {
  id: number;
  uuid: string;
  avatar: string;
  username: string;
  status: string;
  mobile: string;
  email: string | null;
  createdAt: Date;
  status: UserStatusEnum;
  unreadCount: number; // TODO: 临时
}

export enum UserStatusEnum {
  NORMAL = 'Normal',
  DISABLED = 'Disabled',
}

const UserStatusReference = {
  Normal: { text: '正常', color: 'green', status: 'Processing' },
  Disabled: { text: '禁用', color: 'orange', status: 'Warning' },
};
export { UserStatusReference };

export interface IUpdateUser {
  status: UserStatusEnum;
}
