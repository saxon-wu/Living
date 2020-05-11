import Router from "next/router";
import { AnimatePresence } from "framer-motion";
import NProgress from "nprogress";
import UserContext from "../components/UserContext";
import "../styles/index.css";
import "../styles/nprogress.css";
import "react-toastify/dist/ReactToastify.css";
import { useState, useEffect } from "react";
import store from "store2";
import { isEmpty, isObject } from "lodash";
import {
  LIVING_USER,
  LIVING_ACCESS_TOKEN,
  LIVING_THEME,
} from "../lib/contants";
import Cookies from "universal-cookie";

Router.events.on("routeChangeStart", (url) => {
  console.log(`Loading: ${url}`);
  NProgress.start();
});
Router.events.on("routeChangeComplete", () => NProgress.done());
Router.events.on("routeChangeError", () => NProgress.done());

const livingTheme = store.get(LIVING_THEME);
if (livingTheme) {
  document.body.classList.add(livingTheme);
}

export default function MyApp({ Component, pageProps, router }) {
  const [user, setUser] = useState({});

  const cookies = new Cookies();

  /**
   * useEffect1和useEffect2不可合并以免出现死循
   */
  useEffect(() => {
    /**
     * useEffect1
     * componentDidMount: localStorage中存在userInfo，则设置到state中
     */
    const userInfo = store.get(LIVING_USER);
    const livingTheme = store.get(LIVING_THEME);
    if (userInfo) {
      setUser(userInfo);
    }
    if (livingTheme) {
      document.body.classList.add(livingTheme);
    }
  }, []);

  useEffect(() => {
    /**
     * useEffect2
     * componentDidMount componentDidUpdate 都执行 cookie中不存在token，但localStorage存在userInfo的情况下，说明cookie已过期，清除userInfo
     */
    const token = cookies.get(LIVING_ACCESS_TOKEN);
    const userInfo = store.get(LIVING_USER);
    // console.log(token);
    // console.log(userInfo);
    if (!token && userInfo) {
      store.remove(LIVING_USER);
      setUser({});
    }
  });

  /**
   * @description 登录的方法,在请求拦截器中将登录令牌设置于cookie中,不在这里设置
   * @param {*} userInfo
   */
  const signIn = (userInfo) => {
    if (isObject(userInfo) && !isEmpty(userInfo)) {
      store.set(LIVING_USER, userInfo);
      setUser(userInfo);
    }
  };

  const signOut = () => {
    store.remove(LIVING_USER);
    cookies.remove(LIVING_ACCESS_TOKEN, {
      path: "/",
    });
    setUser({});
    Router.push("/signin");
  };

  return (
    <UserContext.Provider
      value={{
        user,
        signIn,
        signOut,
      }}
    >
      <AnimatePresence exitBeforeEnter>
        <Component {...pageProps} />
      </AnimatePresence>
    </UserContext.Provider>
  );
}
