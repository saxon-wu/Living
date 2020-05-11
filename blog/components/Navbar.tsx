import { ThemeEnum } from "../lib/enum";
import Link from "next/link";
import { useContext } from "react";
import { queryWhoamiUserService } from "../lib/services/user.service";
import UserContext from "./UserContext";
import classnames from "classnames";
import { AVATAR_SM, LIVING_THEME } from "../lib/contants";
import { motion } from "framer-motion";
import store from "store2";

type Props = {
  transparent?: boolean;
};

const Navbar: React.FunctionComponent<Props> = ({ transparent }) => {
  const { user, signIn, signOut } = useContext(UserContext);

  const switchTheme = (theme: ThemeEnum): void => {
    const classList = document.body.classList;
    for (let i = 0; i < classList.length; i++) {
      if (classList[i].includes("theme-")) {
        document.body.classList.remove(classList[i]);
      }
    }
    const livingTheme = "theme-" + theme.toLowerCase();
    document.body.classList.add(livingTheme);

    store.set(LIVING_THEME, livingTheme);
  };

  const refetchUserinfo = () => {
    queryWhoamiUserService().then((res) => {
      const { results } = res;
      signIn({
        id: results?.id,
        username: results?.username,
        avatarUrl: results?.avatar?.url,
      });
    });
  };

  return (
    <nav
      className={classnames(
        "flex flex-wrap items-center justify-between px-2 py-3 navbar-expand-lg z-50 w-full",
        {
          "top-0 absolute bg-transparent": transparent,
          "relative shadow-lg bg-white shadow-lg": !transparent,
        }
      )}
    >
      <div className="flex items-center flex-shrink-0 mr-6">
        <motion.div
          animate={{
            scale: [1, 2, 2, 1, 1],
            rotate: [0, 0, 270, 270, 0],
            borderRadius: ["20%", "20%", "50%", "50%", "20%"],
          }}
          transition={{
            duration: 2,
            ease: "easeInOut",
            times: [0, 0.2, 0.5, 0.8, 1],
            // loop: Infinity,
            repeatDelay: 3,
          }}
        >
          <img
            className="w-16 ml-2"
            src="/assets/brand-96x96.svg"
            alt="Welcome to Living"
          />
        </motion.div>
        {/* <span className="font-semibold text-xl tracking-tight">
         Living
        </span> */}
      </div>
      <div className={classnames("block flex-grow flex items-center w-auto")}>
        <ul
          className={classnames("text-sm flex-grow", {
            "text-white": transparent,
            "text-gray-800": !transparent,
          })}
        >
          <li className="block inline-block">
            <Link href="/">
              <a className="mt-0 hover:text-gray-300 lg:mr-4 p-5">Home</a>
            </Link>
          </li>
          <li className="block inline-block">
            <Link href="/about">
              <a className="mt-0 hover:text-gray-300 lg:mr-4 p-5">About</a>
            </Link>
          </li>
          <li className="block inline-block relative Y-has-dropdown">
            <a className="mt-0 hover:text-gray-300 lg:mr-4 p-5" href="#">
              Theme
            </a>
            <ul className="rounded shadow-md text-white bg-gradient-br-primary-2 absolute top-0 mt-6 mr-1 z-30 hidden">
              <li
                className="no-underline px-4 py-2 block hover:text-gray-300 cursor-pointer"
                onClick={() => switchTheme(ThemeEnum.DEFAULT)}
              >
                默认
              </li>
              <li
                className="no-underline px-4 py-2 block hover:text-gray-300 cursor-pointer"
                onClick={() => switchTheme(ThemeEnum.LIGHT)}
              >
                神秘
              </li>
              <li
                className="no-underline px-4 py-2 block hover:text-gray-300 cursor-pointer"
                onClick={() => switchTheme(ThemeEnum.DARK)}
              >
                淡雅
              </li>
            </ul>
          </li>
        </ul>
        <div
          className={classnames("flex justify-start items-center pr-10", {
            "text-white": transparent,
            "text-gray-800": !transparent,
          })}
        >
          <a
            className="block flex items-center hover:text-gray-300 mr-5"
            href="https://github.com/saxon-wu/Living"
          >
            <svg
              className="fill-current w-5 h-5"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
            >
              <title>GitHub</title>
              <path d="M10 0a10 10 0 0 0-3.16 19.49c.5.1.68-.22.68-.48l-.01-1.7c-2.78.6-3.37-1.34-3.37-1.34-.46-1.16-1.11-1.47-1.11-1.47-.9-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.52 2.34 1.08 2.91.83.1-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.94 0-1.1.39-1.99 1.03-2.69a3.6 3.6 0 0 1 .1-2.64s.84-.27 2.75 1.02a9.58 9.58 0 0 1 5 0c1.91-1.3 2.75-1.02 2.75-1.02.55 1.37.2 2.4.1 2.64.64.7 1.03 1.6 1.03 2.69 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.85l-.01 2.75c0 .26.18.58.69.48A10 10 0 0 0 10 0"></path>
            </svg>
          </a>
          {user.username ? (
            <div className="p-1 flex flex-row relative Y-has-dropdown">
              <img
                className="inline-block h-8 w-8 rounded-full"
                src={user.avatarUrl + AVATAR_SM}
                alt=""
              />
              <a
                href="#"
                className="p-2 no-underline hidden md:block lg:block"
              >
                {user.username}
              </a>
              <ul className="rounded hidden shadow-md bg-white text-gray-800 absolute top-0 mt-10 right-0 z-30">
                <li>
                  <div
                    onClick={refetchUserinfo}
                    className="no-underline px-4 py-2 block hover:bg-gray-300"
                  >
                    刷新我的信息
                  </div>
                </li>
                <li>
                  <Link href="/u/setting">
                    <a
                      href="#"
                      className="no-underline px-4 py-2 block hover:bg-gray-300"
                    >
                      设置
                    </a>
                  </Link>
                </li>
                <li>
                  <a
                    href="#"
                    className="no-underline px-4 py-2 block hover:bg-gray-300 cursor-pointer"
                  >
                    Notifications
                  </a>
                </li>
                <li>
                  <hr className="border-t mx-8 border-gray-ligght" />
                </li>
                <li>
                  <Link
                    as={`/p/new/${Math.random().toString().substr(2)}`}
                    href="/p/[...edit]"
                  >
                    <a className="no-underline px-4 py-2 block hover:bg-gray-300 cursor-pointer">
                      发布文章
                    </a>
                  </Link>
                </li>
                <li>
                  <hr className="border-t mx-2 border-gray-ligght" />
                </li>
                <li>
                  <div
                    onClick={signOut}
                    className="no-underline px-4 py-2 block hover:bg-gray-300 cursor-pointer"
                  >
                    Logout
                  </div>
                </li>
              </ul>
            </div>
          ) : (
            <Link href="/signin">
              <a className="block flex items-center hover:text-gray-300">
                登录
              </a>
            </Link>
          )}
        </div>
      </div>
      <style jsx>{`
        .Y-has-dropdown:hover ul {
          display: block;
        }
      `}</style>
    </nav>
  );
};

export default Navbar;
