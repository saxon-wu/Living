import { extend } from "umi-request";
import { toast } from "react-toastify";

import Cookies from "universal-cookie";
import { BaseContext } from "next/dist/next-server/lib/utils";
import { LIVING_ACCESS_TOKEN, LIVING_USER } from "./contants";
import store from "store2";

const APP_URL_PREFIX = process.env.APP_URL_PREFIX;
if (!APP_URL_PREFIX?.includes("http")) {
  throw new Error("Missing the.env or .env.development file, see README.md");
}

/**
 * 配置request请求时的默认参数
 */
const http = (ctx?: BaseContext) => {
  const options: any = {
    credentials: "same-origin",
    prefix: `${process.env.APP_URL_PREFIX}/api/v1`,
    headers: {},
  };

  const cookies = new Cookies(ctx?.req?.headers?.cookie || null);
  const token = cookies.get(LIVING_ACCESS_TOKEN);
  if (token) {
    options.headers.Authorization = `Bearer ${token}`;
  }

  const request = extend(options);

  request.interceptors.response.use(
    async (response) => {
      const res = await response.clone().json();

      if (res.statusCode === 401) {
        cookies.remove(LIVING_ACCESS_TOKEN);
        store.remove(LIVING_USER);
        if (
          typeof window !== "undefined" &&
          window.location.pathname !== "/signin"
        ) {
          // window.location.replace("/signin");
        }
        toast.error(res.message);
      } else if (res.statusCode === 429) {
        console.log(res.message);
      } else if (res.statusCode !== 0) {
        toast.error(res.message || "网络异常，无法连接服务器");
      }

      if (
        response.url.includes("/auth/login") ||
        response.url.includes("/auth/register")
      ) {
        const { accessToken, expiresIn } = res.results;
        if (accessToken && expiresIn) {
          const expires = new Date(Date.now() + expiresIn * 1000);
          cookies.set(LIVING_ACCESS_TOKEN, accessToken, { expires, path: "/" });
        }
      }
      return response;
    },
    { global: false }
  );
  return request;
};

export default http;
