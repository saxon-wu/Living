import { createContext } from "react";

type UserInfoType = {
  id: string;
  username: string;
  avatarUrl: string;
};

/**
 * 401 时删除localStorage 中的 userInfo
 * 监听cookie accessToken 不存在时，或过期时 删除localStorage 中的 userInfo
 */
const UserContext = createContext({
  user: {
    id: "",
    username: "",
    avatarUrl: "",
  },
  signIn(_username: UserInfoType) {},
  signOut() {},
});

export default UserContext;
