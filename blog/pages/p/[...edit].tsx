import Router, { useRouter } from "next/router";
import dynamic from "next/dynamic";
import { useState, SyntheticEvent, useContext, useEffect } from "react";
import EditorJS, { OutputData } from "@editorjs/editorjs";
import { toast } from "react-toastify";
import {
  updateArticleService,
  createArticleService,
  queryArticleService,
} from "../../lib/services/article.service";
import Layout from "../../components/Layout";
import Container from "../../components/Container";
import UserContext from "../../components/UserContext";
import Link from "next/link";
import { debounce } from "lodash";

const Editor = dynamic(() => import("../../components/Editor"), {
  ssr: false,
  loading: () => <p>...</p>,
});
let editorInstance: EditorJS;

/**
 *  未登录的用户不可以打开些页面
 *  useEffect 中执行两次 componentDidMount 和 componentDidUpdate(user,query变化)
 *  当浏览器刷新时componentDidMount未能获得user和query的值。
 *  当user和query变化时才能获得值，能取到值时就把定时器清除，使得定时器执行前清除
 */
const timebomb = debounce(() => {
  Router.replace("/");
}, 300);

type Props = {};

const Name: React.FunctionComponent<Props> = () => {
  const { user } = useContext(UserContext);
  const [titleState, setTitleState] = useState("");
  const [articleIdState, setArticleIdState] = useState("");

  const router = useRouter();
  const query = router.query;

  useEffect(() => {
    timebomb();
    if (user.username) {
      timebomb.cancel();
      // 在这里执行目的：1.避免多余的请求
      getArticle();
    }
  }, [user, query]);

  const getArticle = async () => {
    const [action, id] = query.edit || [];
    if (action !== "update") {
      return;
    }
    if (!id) {
      toast.warn("亲，参数不正确");
      return;
    }
    const { results } = await queryArticleService(id);
    if (!results?.isOwnership) {
      // 不是作者，不可修改
      Router.replace("/");
      return;
    }
    setTitleState(results.title);
    setArticleIdState(results.id);
    try {
      await editorInstance.isReady;
      editorInstance?.render(results.content);
    } catch (reason) {
      console.error(`Editor.js initialization failed because of ${reason}`);
    }
  };

  const submit = async (
    isPublic: boolean,
    event: SyntheticEvent
  ): Promise<void> => {
    event.preventDefault();
    const content: OutputData = await editorInstance.save();
    let res: any;
    switch (query.edit[0]) {
      case "update":
        const id = query.edit[1];
        // 更新
        res = await updateArticleService({
          id,
          data: { title: titleState, content, isPublic },
        });
        break;
      case "new":
        res = await createArticleService({
          data: { title: titleState, content, isPublic },
        });
        break;
    }
    res.results?.title && Router.replace(`/p/${res.results.id}`);
    toast.success(res.message);
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
        <Container full={true}>
          <section className="p-10 rounded-lg mb-20">
            <form className="bg-white rounded-md p-10 pt-5 shadow-xl">
              <div className="flex justify-between m-2">
                <Link as={`/p/${articleIdState}`} href="/p/[id]">
                  <button className="mx-2 my-1 px-4 py-2 rounded bg-gray-200 text-gray-600 hover:bg-gray-300 hover:text-white">
                    取消编辑
                  </button>
                </Link>
                <div>
                  <button
                    className="mx-2 my-1 px-4 py-2 rounded bg-orange-200 text-orange-600 hover:bg-orange-300 hover:text-white"
                    type="button"
                    onClick={() => {
                      editorInstance.blocks.clear();
                    }}
                  >
                    清空
                  </button>
                  <button
                    className="mx-2 my-1 px-4 py-2 border-b-2 border-blue-400 font-bold text-blue-500 hover:border-blue-500"
                    type="button"
                    onClick={(e) => {
                      submit(false, e);
                    }}
                  >
                    保存为草稿
                  </button>
                  <button
                    className="mx-2 my-1 border-2 border-blue-500 px-4 py-2 text-blue-500 hover:text-white hover:bg-blue-500 rounded"
                    type="button"
                    onClick={(e) => {
                      submit(true, e);
                    }}
                  >
                    立即发布
                  </button>
                </div>
              </div>
              <div className="flex items-center border-b border-b-1 border-teal-500 py-2">
                <input
                  className="appearance-none bg-transparent border-none w-full text-gray-800 mr-3 py-1 px-2 focus:outline-none font-bold"
                  type="text"
                  placeholder="标题"
                  value={titleState}
                  onChange={(e) => setTitleState(e.target.value)}
                />
              </div>
              <div className="mt-4">
                <Editor
                  instanceRef={(instance: any) => (editorInstance = instance)}
                  placeholder="内容"
                  data={{ blocks: [] }}
                />
              </div>
            </form>
          </section>
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

export default Name;
