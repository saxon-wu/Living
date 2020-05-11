import Router, { useRouter } from "next/router";
import ErrorPage from "next/error";
import Layout from "../../components/Layout";
import Container from "../../components/Container";
import PostHeader from "../../components/PostHeader";
import PostTitle from "../../components/PostTitle";
import Head from "next/head";
import PostSidebar from "../../components/PostSidebar";
import { queryArticleService } from "../../lib/services/article.service";
import { BaseContext } from "next/dist/next-server/lib/utils";
import { GetServerSideProps } from "next";
import dynamic from "next/dynamic";
import { useState, useEffect } from "react";
import { queryCommentsService } from "../../lib/services/comment.service";
import Link from "next/link";
import renderHtml from "../../lib/renderHtml";
import markdownStyles from "../../styles/markdown-styles.module.css";
import { SortEnum } from "../../lib/enum";

const Comment = dynamic(() => import("../../components/Comment"), {
  ssr: false,
});

type Props = {
  post: any;
};

const Post: React.FunctionComponent<Props> = ({ post }) => {
  const [commentsState, setCommentsState] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortState, setSortState] = useState(SortEnum.DESC);
  const [totalPagesState, setTotalPagesState] = useState(0);

  const router = useRouter();

  useEffect(() => {
    getComments();
  }, []);

  // const editMode = () => {
  //   const temp = !editable;
  //   setEditable(temp);
  //   const elements = document.querySelectorAll(`[contenteditable=${!temp}]`);
  //   elements.forEach((element) => {
  //     element.setAttribute("contenteditable", temp.toString());
  //   });
  //   const ceToolbar = document.getElementsByClassName("ce-toolbar")[0] as any;
  //   ceToolbar && (ceToolbar.style.display = temp ? "block" : "none");
  // };

  const getComments = async (
    sort: SortEnum = sortState,
    startAgain?: boolean
  ) => {
    let current = currentPage;
    let comments = commentsState;
    if (startAgain) {
      // 选择排序后，分页应该从头算起
      current = 1;
      comments = [];
      setCurrentPage(1);
      setCommentsState([]);
    }

    // 记录排序的状态，以方便排序按钮active样式
    setSortState(sort);

    const { results } = await queryCommentsService({
      id: post.id,
      current,
      pageSize: 10,
      sort,
    });
    const items: any[] = results.items;

    // 设置总页数
    setTotalPagesState(results.meta.totalPages);

    if (!items) {
      return;
    }
    setCurrentPage(current + 1);
    setCommentsState([...comments, ...items]);
  };

  if (!router.isFallback && !post?.title) {
    return <ErrorPage statusCode={404} />;
  }
  return (
    <Layout>
      <div className="Y-jumbotron relative mb-2 pb-4 flex flex-col items-center justify-center text-white bg-gradient-r-primary-3">
        <img
          className="w-56 p-5 inline-block"
          src="/assets/logo.svg"
          alt="Welcome to Living"
        />
      </div>
      <Container>
        {router.isFallback ? (
          <PostTitle>Loading…</PostTitle>
        ) : (
          <>
            <Head>
              <title>
                {post.title} | 全栈开源 {process.env.APP_NAME}
              </title>
              <meta property="og:image" content={post.ogImage?.url} />
            </Head>
            <div className="mb-32">
              <div className="inline-flex mb-2">
                <button
                  className="bg-gray-100 hover:bg-gray-300 text-gray-600 font-bold py-2 px-4 rounded-l"
                  onClick={() => Router.back()}
                >
                  Go Back
                </button>
              </div>
              <div className="max-w-4xl mx-auto flex items-start py-8 px-0">
                <div className="w-full md:pr-12 mb-12">
                  <PostHeader
                    title={post.title}
                    coverImage={post.coverImage}
                    date={post.createdAt}
                    author={post.publisher}
                  />
                  {post.isOwnership && (
                    <Link as={`/p/update/${post.id}`} href="/p/[...edit]">
                      <a className="underline px-4 py-2 text-yellow-500 hover:text-yellow-600">
                        编辑
                      </a>
                    </Link>
                  )}
                  {renderHtml(post.content.blocks).map((v, index) => (
                    <div
                      className={markdownStyles["markdown"]}
                      key={index}
                      dangerouslySetInnerHTML={{ __html: v }}
                      // className="tracking-wide leading-5"
                    ></div>
                  ))}
                  <Comment
                    comments={commentsState}
                    total={post.commentsCount}
                    articleId={post.id}
                    getComments={getComments}
                    sortState={sortState}
                  />
                  {totalPagesState > currentPage ? (
                    <div className="flex justify-between text-xs">
                      <button className="text-white no-underline py-2 px-3 rounded"></button>
                      <button
                        className="bg-default hover:bg-gray-200 text-default font-semibold py-2 px-4 border border-gray-200 rounded shadow"
                        style={{ transition: "all .15s ease" }}
                        onClick={getComments.bind(
                          null,
                          sortState,
                          /* startAgain */ false
                        )}
                      >
                        加载更多
                      </button>
                    </div>
                  ) : (
                    <div className="text-gray-600 text-center">
                      {totalPagesState ? "--- 没有了哦 ---" : "快快来评论吧"}
                    </div>
                  )}
                </div>
                <PostSidebar />
              </div>
            </div>
          </>
        )}
      </Container>
      <style jsx>{`
        .Y-jumbotron:after {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-image: url("data:image/svg+xml,%3Csvg width='70' height='70' viewBox='0 0 70 70' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.1' fill-rule='evenodd'%3E%3Cpath d='M0 0h35v35H0V0zm5 5h25v25H5V5zm5 5h15v15H10V10zm5 5h5v5h-5v-5zM40 5h25v25H40V5zm5 5h15v15H45V10zm5 5h5v5h-5v-5zM70 35H35v35h35V35zm-5 5H40v25h25V40zm-5 5H45v15h15V45zm-5 5h-5v5h5v-5zM30 40H5v25h25V40zm-5 5H10v15h15V45zm-5 5h-5v5h5v-5z'/%3E%3C/g%3E%3C/svg%3E");
        }
        .Y-submit {
          position: fixed;
          bottom: 100px;
          right: 100px;
        }
      `}</style>
    </Layout>
  );
};

export const getServerSideProps: GetServerSideProps = async (
  context: BaseContext
) => {
  const { params } = context;

  const { results } = await queryArticleService(params.id, context);

  return {
    props: {
      post: {
        ...results,
      },
    },
  };
};

export default Post;
