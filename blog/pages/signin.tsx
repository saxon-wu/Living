import Layout from "../components/Layout";
import Container from "../components/Container";
import { login, register } from "../lib/services/auth.service";
import { useState, SyntheticEvent, useContext } from "react";
import { parse } from "querystring";
import Router from "next/router";
import UserContext from "../components/UserContext";
import SVG, { SvgEnum } from "../components/SVG";
import { toast } from "react-toastify";

enum SignType {
  SIGNIN = "signin",
  SIGNUP = "signup",
}

type Props = {};

const Signin: React.FunctionComponent<Props> = () => {
  const { signIn } = useContext(UserContext);
  const [usernameState, setUsernameState] = useState("");
  const [passwordState, setPasswordState] = useState("");
  const [signTypeState, setSignTypeState] = useState(SignType.SIGNIN);

  const submit = async (e: SyntheticEvent) => {
    e.preventDefault();
    let _results;
    if (signTypeState === SignType.SIGNIN) {
      const { results } = await login({
        data: { username: usernameState, password: passwordState },
      });
      _results = results;
    } else {
      const { results } = await register({
        data: { username: usernameState, password: passwordState },
      });
      _results = results;
    }

    signIn({
      id: _results?.id,
      username: _results?.username,
      avatarUrl: _results?.avatar?.url,
    });
    const urlParams = new URL(window.location.href);
    const params = parse(window.location.href.split("?")[1]);
    let { redirect } = params as { redirect: string };
    if (redirect) {
      const redirectUrlParams = new URL(redirect);
      if (redirectUrlParams.origin === urlParams.origin) {
        redirect = redirect.substr(urlParams.origin.length);
        if (redirect.match(/^\/.*#/)) {
          redirect = redirect.substr(redirect.indexOf("#") + 1);
        }
      } else {
        window.location.href = "/";
        return;
      }
    }

    Router.replace(redirect || "/");
  };

  return (
    <>
      <Layout setNavbarTransparent={false}>
        <SVG svg={SvgEnum.BG} className={"fixed text-primary-1 opacity-25"} />
        <Container>
          <div className="w-screen h-screen max-w-full grid grid-cols-2 gap-8 px-2 transform -translate-y-20">
            <div className="flex justify-end items-center z-10">
              <SVG svg={SvgEnum.PHONE} className={"text-primary-1"} />
            </div>
            <div className="flex justify-start items-center text-center">
              <form className="Y-form" onSubmit={submit}>
                <SVG
                  svg={SvgEnum.AVATAR}
                  className={"h-20 inline-block text-primary-1"}
                />
                <h2 className="my-2 text-gray-900 text-5xl font-bold">
                  {signTypeState === SignType.SIGNIN ? "来登啊" : "来注啊"}
                </h2>
                {[
                  { label: "用户名", field: "username", type: "text" },
                  { label: "密码", field: "password", type: "password" },
                ].map((v, index) => (
                  <div
                    className="Y-input-div relative grid my-3 py-2 border-b-2"
                    style={{ gridTemplateColumns: "7% 93%" }}
                    key={index}
                  >
                    <div className="relative h-10 text-gray-300 flex justify-center items-center font-black">
                      {v.field === "username" ? (
                        <svg
                          className="h-4 w-4 text-gray-500"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                            clipRule="evenodd"
                          />
                        </svg>
                      ) : (
                        <svg
                          className="h-4 w-4 text-gray-500"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </div>
                    <div className="relative h-10">
                      <h5 className="Y-label text-gray-600 text-xs">
                        {v.label}
                      </h5>
                      <input
                        type={v.type}
                        className="absolute left-0 top-0 w-full h-full py-4 outline-none text-gray-900 text-lg px-3 py-2 bg-transparent"
                        required
                        onFocus={(e) => {
                          e.target.parentNode?.parentElement?.classList.add(
                            "Y-focus"
                          );
                        }}
                        onBlur={(e) => {
                          !e.target.value &&
                            e.target.parentNode?.parentElement?.classList.remove(
                              "Y-focus"
                            );
                        }}
                        value={
                          v.field === "username" ? usernameState : passwordState
                        }
                        onChange={(e) =>
                          v.field === "username"
                            ? setUsernameState(e.target.value)
                            : setPasswordState(e.target.value)
                        }
                      />
                    </div>
                  </div>
                ))}
                <div className="-mt-1 flex justify-between">
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      toast.info("暂未实现，臣妾帮不了啦");
                    }}
                    className="text-gray-500 text-sm hover:text-primary-1"
                  >
                    忘记密码?
                  </a>
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setSignTypeState(
                        signTypeState === SignType.SIGNIN
                          ? SignType.SIGNUP
                          : SignType.SIGNIN
                      );
                    }}
                    className="text-gray-500 text-sm hover:text-primary-1"
                  >
                    {signTypeState === SignType.SIGNIN ? "注册" : "登录"}
                  </a>
                </div>
                <button
                  className="Y-btn bg-gradient-r-primary-3 my-3 rounded-full flex items-center shadow px-4 py-2 text-white w-full justify-center text-lg"
                  type="submit"
                >
                  {signTypeState === SignType.SIGNIN ? "登录" : "注册"}
                </button>
              </form>
            </div>
          </div>
        </Container>
      </Layout>
      <style jsx>{`
        .Y-form {
          width: 300px;
        }
        .Y-input-div:before,
        .Y-input-div:after {
          content: "";
          position: absolute;
          bottom: -2px;
          width: 0%;
          height: 2px;
          background-image: linear-gradient(
            to right,
            var(--color-bg-primary),
            var(--color-bg-secondary),
            var(--color-bg-primary)
          );
          transition: 0.4s;
        }
        .Y-input-div:before {
          right: 50%;
        }
        .Y-input-div:after {
          left: 50%;
        }
        .Y-label {
          position: absolute;
          left: 10px;
          top: 50%;
          transform: translateY(-50%);
          color: #999;
          font-size: 18px;
          transition: 0.3s;
        }
        .Y-btn {
          background-size: 200%;
          transition: 0.5s;
        }
        .Y-btn:hover {
          background-position: right;
        }
        .Y-focus:before,
        .Y-focus:after {
          width: 50%;
        }
        .Y-focus > div > h5 {
          top: -8px;
          font-size: 15px;
        }
        .Y-focus > .i > i {
          color: #38d39f;
        }
        input:-webkit-autofill {
          box-shadow: 0 0 0px 1000px white inset;
        }
      `}</style>
    </>
  );
};

export default Signin;
