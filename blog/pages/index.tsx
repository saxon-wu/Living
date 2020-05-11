import Layout from "../components/Layout";
import Container from "../components/Container";
import HorizontalCard from "../components/HorizontalCard";
import PostSidebar from "../components/PostSidebar";
import { queryArticlesService } from "../lib/services/article.service";
import { GetServerSideProps } from "next";
import { useState, useEffect } from "react";

type Props = {
  firstPagePosts: any;
};

const PostIndex: React.FunctionComponent<Props> = ({ firstPagePosts }) => {
  const [postsState, setPostsState] = useState([{}]);
  const [currentPageState, setcurrentPageState] = useState(2);

  useEffect(() => {
    const items: any[] = firstPagePosts?.results?.items;
    if (items) {
      setPostsState([...items]);
    }
  }, []);

  const nextPage = async () => {
    const { results } = await queryArticlesService({
      current: currentPageState,
      pageSize: 10,
    });
    const _items: any[] = results?.items;

    if (!_items) {
      return;
    }
    setcurrentPageState(currentPageState + 1);
    setPostsState([...postsState, ..._items]);
  };

  return (
    <Layout setNavbarTransparent={true}>
      <div className="Y-jumbotron relative mb-2 pb-4 flex flex-col items-center justify-center text-white bg-gradient-r-primary-2">
        <img
          className="w-56 p-5 inline-block"
          src="/assets/logo.svg"
          alt="Welcome to Living"
        />
        <h1 className="text-white text-6xl pb-4">动态Blog系统</h1>
        <p className="text-white">
          功能：登录 注册 发表文章 修改文章 删除文章 修改头像 评论 回复 点赞
          收藏 ...
        </p>
        <h2
          className="bg-yellow-400 font-bold my-8 p-3 text-lg md:text-2xl"
          style={{ transform: "skewY(-3deg)" }}
        >
          基于Next.js服务端和客户端渲染的示例
        </h2>
      </div>
      <Container>
        <div className="max-w-4xl mx-auto md:flex items-start py-8 px-12 md:px-0">
          <div className="w-full md:pr-12 mb-12">
            {postsState.map((item: any, index) => (
              <HorizontalCard key={index} data={item} />
            ))}
            <div className="flex justify-between text-xs">
              <button className="text-white no-underline py-2 px-3 rounded"></button>
              <button
                className="bg-default hover:bg-gray-200 text-default font-semibold py-2 px-4 border border-gray-200 rounded shadow"
                style={{ transition: "all .15s ease" }}
                onClick={nextPage}
              >
                加载更多
              </button>
            </div>
          </div>

          <PostSidebar />
        </div>
      </Container>
      <style jsx>{`
        .Y-jumbotron {
          clip-path: polygon(50% 0%, 100% 0, 100% 65%, 50% 100%, 0 65%, 0 0);
        }
        .Y-jumbotron:after {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-image: url("data:image/svg+xml,%3Csvg width='84' height='48' viewBox='0 0 84 48' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h12v6H0V0zm28 8h12v6H28V8zm14-8h12v6H42V0zm14 0h12v6H56V0zm0 8h12v6H56V8zM42 8h12v6H42V8zm0 16h12v6H42v-6zm14-8h12v6H56v-6zm14 0h12v6H70v-6zm0-16h12v6H70V0zM28 32h12v6H28v-6zM14 16h12v6H14v-6zM0 24h12v6H0v-6zm0 8h12v6H0v-6zm14 0h12v6H14v-6zm14 8h12v6H28v-6zm-14 0h12v6H14v-6zm28 0h12v6H42v-6zm14-8h12v6H56v-6zm0-8h12v6H56v-6zm14 8h12v6H70v-6zm0 8h12v6H70v-6zM14 24h12v6H14v-6zm14-8h12v6H28v-6zM14 8h12v6H14V8zM0 8h12v6H0V8z' fill='%23ffffff' fill-opacity='0.1' fill-rule='evenodd'/%3E%3C/svg%3E");
        }
        .Y-jumbotron > h1 {
          text-shadow: 0 0 14px rgba(37, 30, 30, 0.28);
        }
        .Y-jumbotron > p {
          text-shadow: 0 0 14px rgba(0, 0, 0, 0.28);
        }
      `}</style>
    </Layout>
  );
};

export const getServerSideProps: GetServerSideProps = async () => {
  const firstPagePosts = await queryArticlesService({
    current: 1,
    pageSize: 10,
  });

  return {
    props: { firstPagePosts },
  };
};

export default PostIndex;
