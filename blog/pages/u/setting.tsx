import { useContext, useRef } from "react";
import UserContext from "../../components/UserContext";
import { uploadByFileService } from "../../lib/services/file.service";
import { AVATAR_SM } from "../../lib/contants";
import Layout from "../../components/Layout";
import Container from "../../components/Container";

type Props = {};

const Setting: React.FunctionComponent<Props> = () => {
  const { user, signIn } = useContext(UserContext);

  const fileRef = useRef<HTMLInputElement | null>(null);

  const upload = async (event: any) => {
    const files = fileRef.current?.files;
    if (files) {
      const formData = new FormData();
      formData.append("image", files[0]);
      formData.append("purpose", "Avatar");
      event.target.value = null;
      const { results } = await uploadByFileService({
        data: formData,
      });
      signIn({
        id: results?.uploader?.id,
        username: results?.uploader?.username,
        avatarUrl: results?.url,
      });
    }
  };

  return (
    <>
      <Layout>
        <div className="Y-jumbotron relative mb-2 pb-4 flex flex-col items-center justify-center text-white bg-conic-tr-primary-3">
          <img
            className="w-56 p-5 inline-block"
            src="/assets/logo.svg"
            alt="Welcome to Living"
          />
        </div>
        <Container>
          <div className="flex flex-wrap mx-auto px-2 pt-8">
            <div className="w-1/5 px-6 text-xl text-gray-800 leading-normal">
              <div className="sticky inset-0 h-64" style={{ top: "5em" }}>
                <ul className="list-reset">
                  <li className="py-2">
                    <a
                      href="#"
                      className="block pl-4 align-middle text-gray-700 no-underline hover:text-primary-1 border-l-4 border-transparent hover:border-primary-1 border-primary-1 "
                    >
                      <span className="pb-1 md:pb-0 text-sm text-gray-900 font-bold">
                        基本设置
                      </span>
                    </a>
                  </li>
                  <li className="py-2">
                    <a
                      href="#"
                      className="block pl-4 align-middle text-gray-700 no-underline hover:text-primary-1 border-l-4 border-transparent hover:border-gray-400"
                    >
                      <span className="pb-1 md:pb-0 text-sm">安全设置</span>
                    </a>
                  </li>
                  <li className="py-2">
                    <a
                      href="#"
                      className="block pl-4 align-middle text-gray-700 no-underline hover:text-primary-1 border-l-4 border-transparent hover:border-gray-400"
                    >
                      <span className="pb-1 md:pb-0 text-sm">账号绑定</span>
                    </a>
                  </li>
                  <li className="py-2">
                    <a
                      href="#"
                      className="block pl-4 align-middle text-gray-700 no-underline hover:text-primary-1 border-l-4 border-transparent hover:border-gray-400"
                    >
                      <span className="pb-1 md:pb-0 text-sm">账号管理</span>
                    </a>
                  </li>
                  <li className="py-2">
                    <a
                      href="#"
                      className="block pl-4 align-middle text-gray-700 no-underline hover:text-primary-1 border-l-4 border-transparent hover:border-gray-400"
                    >
                      <span className="pb-1 md:pb-0 text-sm">新消息通知</span>
                    </a>
                  </li>
                </ul>
              </div>
            </div>
            <div className="w-4/5 p-8 mt-6 mt-0 text-gray-900 leading-normal bg-white border border-gray-400 border-rounded">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <fieldset>
                    <label htmlFor="form-email">邮箱</label>
                    <input
                      type="email"
                      id="form-email"
                      className="border-pink-400"
                    />
                  </fieldset>
                  <fieldset>
                    <label htmlFor="form-nickname">昵称</label>
                    <input
                      type="text"
                      id="form-nickname"
                      className="border-pink-400"
                    />
                  </fieldset>
                </div>
                <div className="flex items-center flex-col">
                  <div className="w-48 h-48 overflow-hidden rounded-full">
                    <img
                      className="w-full"
                      src={`${user.avatarUrl}${AVATAR_SM}`}
                      alt={user.username}
                    />
                  </div>
                  <input
                    ref={fileRef}
                    type="file"
                    className="border-2 border-blue-500 px-4 py-2 text-blue-500 hover:text-white hover:bg-blue-500 rounded w-32"
                    onChange={(e) => {
                      upload(e);
                    }}
                  />
                  更换头像
                </div>
              </div>
            </div>
          </div>
        </Container>
      </Layout>
      <style jsx>{`
        .Y-jumbotron {
          clip-path: polygon(50% 0%, 100% 0, 100% 100%, 99% 100%, 0 65%, 0 0);
        }
        .Y-jumbotron:after {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-image: url("data:image/svg+xml,%3Csvg width='70' height='70' viewBox='0 0 70 70' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.1' fill-rule='evenodd'%3E%3Cpath d='M0 0h35v35H0V0zm5 5h25v25H5V5zm5 5h15v15H10V10zm5 5h5v5h-5v-5zM40 5h25v25H40V5zm5 5h15v15H45V10zm5 5h5v5h-5v-5zM70 35H35v35h35V35zm-5 5H40v25h25V40zm-5 5H45v15h15V45zm-5 5h-5v5h5v-5zM30 40H5v25h25V40zm-5 5H10v15h15V45zm-5 5h-5v5h5v-5z'/%3E%3C/g%3E%3C/svg%3E");
        }
      `}</style>
    </>
  );
};

export default Setting;
