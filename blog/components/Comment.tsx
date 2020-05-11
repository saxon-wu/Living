import {
  likeCommentService,
  likeReplyService,
  createCommentService,
  createReplyService,
} from "../lib/services/comment.service";
import { useContext, useEffect, useState } from "react";
import UserContext from "./UserContext";
import Link from "next/link";
import { AVATAR_SM } from "../lib/contants";
import classNames from "classnames";
import { toast } from "react-toastify";
import { useRef } from "react";
import { SortEnum, DayTypeEnum } from "../lib/enum";
import Date from "../components/Date";

enum CommentType {
  COMMENT = "comment",
  REPLY = "reply",
}

type contentType = {
  [x: string]: {
    content: string;
    replyParentId: string;
    replyParentUsername: string;
  };
};

// 给防抖使用
let timer: any = 0;

type Props = {
  comments: any[];
  articleId: string;
  total: number;
  getComments: () => void;
  sortState: SortEnum;
};

const Comment: React.FunctionComponent<Props> = ({
  comments,
  articleId,
  total,
  getComments,
  sortState,
}) => {
  const { user } = useContext(UserContext);
  const [commentsState, setCommentsState] = useState(comments);
  const [commentBtnState, setCommentBtnState] = useState(false);
  const [contentState, setContentState] = useState<contentType>({
    // 初始化值，默认的commentId是new，即对文章评论
    new: {
      content: "",
      replyParentId: "",
      replyParentUsername: "",
    },
  });
  // 用于比较点赞数的变化，多次点击前后无变化，则无需请求
  const [oldCountState, setOldCountState] = useState<number | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (comments) {
      setCommentsState(comments);
    }
  }, [comments]);

  /**
   * @description 点赞
   * replyIndex是undefined时说明是对comment的操作
   * @param {string} id
   * @param {number} comentIndex
   * @param {number} [replyIndex]
   */
  const like = async (id: string, comentIndex: number, replyIndex?: number) => {
    const comment = commentsState[comentIndex];
    const reply =
      typeof replyIndex === "undefined" ? [] : comment.replies[replyIndex];

    let likesCount: number =
      typeof replyIndex === "undefined" ? comment.likesCount : reply.likesCount;
    let likes: any[] =
      typeof replyIndex === "undefined" ? comment.likes : reply.likes;

    // 原先的点赞数存入状态，方便比对
    if (oldCountState === null) {
      setOldCountState(likesCount);
    }
    const likeOfCurrentUser: number = likes.filter(
      (v: { id: string }) => v.id === user.id
    ).length;
    if (!likeOfCurrentUser) {
      likes.push({
        id: user.id,
      });
      likesCount = likesCount + 1;
    } else {
      const index = likes.findIndex((v: { id: string }) => v.id === user.id);
      likes.splice(index, 1);
      likesCount = likesCount - 1;
    }
    // 更新状态，立即反馈给用户，表示已点赞或取消
    if (typeof replyIndex === "undefined") {
      comment.likes = likes;
      comment.likesCount = likesCount;
    } else {
      reply.likes = likes;
      reply.likesCount = likesCount;
    }
    setCommentsState([...commentsState]);

    // 防抖
    if (timer) {
      clearTimeout(timer);
      timer = 0;
    }

    timer = setTimeout(async () => {
      // 对比点赞数，有变化则请求
      if (oldCountState !== likesCount) {
        if (typeof replyIndex === "undefined") {
          const { results } = await likeCommentService({ id });
          comment.likes = results.likes;
          comment.likesCount = results.likesCount;
        } else {
          const { results } = await likeReplyService({ id });
          reply.likes = results.likes;
          reply.likesCount = results.likesCount;
        }
      }
      // 更新状态以响应新数据
      setCommentsState([...commentsState]);
      // 初始化
      setOldCountState(null);
      timer = 0;
    }, 1000);
  };

  /**
   * 提交数据
   * commentId的值有2种可能:
   * 1.是uuid
   * 2.是字符串new
   */
  const submit = async (commentId: string) => {
    if (!user.username) {
      toast.warn("请先登录");
      return;
    }
    if (!contentState[commentId].content) {
      toast.warn("请输入内容");
      return;
    }
    if (commentId && commentId !== "new") {
      let optionalReplyParentId = {};
      if (contentState[commentId].replyParentId) {
        optionalReplyParentId = {
          replyParentId: contentState[commentId].replyParentId,
        };
      }
      await createReplyService({
        data: {
          content: contentState[commentId].content,
          commentId,
          ...optionalReplyParentId,
        },
      });
    } else {
      await createCommentService({
        data: {
          content: contentState[commentId].content,
          articleId,
        },
      });
    }
    setContentState({});
    getComments();
  };

  /**
   * 评论输入框
   * commentId的值有2种可能:
   * 1.是uuid
   * 2.是字符串new
   */
  const commentTextareaBox = (commentId: string) => {
    return (
      <div className="my-4">
        <textarea
          ref={textareaRef}
          className="bg-gray-100 text-gray-700 focus:outline-none focus:shadow-outline border border-gray-300 rounded-lg py-2 px-4 block w-full appearance-none leading-normal"
          placeholder="路过留评"
          /* commentId为new时,是对文章评论,无需对焦 */
          autoFocus={commentId !== "new"}
          onFocus={(e) => {
            const cursorEnd = e.target.value.length;
            e.target.setSelectionRange(cursorEnd, cursorEnd);
            setCommentBtnState(true);
          }}
          onKeyDown={(e) => {
            if (e.ctrlKey && e.keyCode == 13) {
              submit(commentId);
            }
          }}
          onChange={(e) => {
            const { replyParentId, replyParentUsername } = contentState[
              commentId
            ];
            setContentState({
              [commentId]: {
                // 输入框取到的值必须去除 @名字 标识，以防止标识值里循环; 而且是replace不可带g（全局），以防用户输入其它的 @名字 被替换掉
                content: e.target.value.replace(replyParentUsername, ""),
                replyParentId,
                replyParentUsername,
              },
            });
          }}
          value={
            (contentState[commentId]?.replyParentUsername ?? "") +
            (contentState[commentId]?.content ?? "")
          }
        ></textarea>
        {commentBtnState && (
          <div className={classNames("flex items-center justify-between py-3")}>
            <div className="text-gray-500">
              <svg
                className="h-5 w-5 inline-block cursor-pointer"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="text-sm ml-1">Ctrl + Enter 发布</span>
            </div>
            <div>
              <button
                className={classNames(
                  "bg-primary-1 text-white py-1 px-4 rounded focus:outline-none rounded-full mr-2",
                  {
                    "opacity-50 cursor-not-allowed": !contentState,
                    "hover:opacity-75": contentState,
                  }
                )}
                type="button"
                onClick={submit.bind(null, commentId)}
              >
                发布
              </button>
              <button
                className="bg-white hover:opacity-75 text-gray-500 py-1 px-4 rounded border-2 focus:outline-none rounded-full"
                type="button"
                onClick={() => {
                  commentId === "new"
                    ? setCommentBtnState(false)
                    : setContentState({});
                }}
              >
                取消
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  /**
   * 评论展示卡
   */
  const commentCard = (
    item: any,
    commentType: CommentType,
    commentId: string,
    comentIndex: number,
    replyIndex?: number
  ) => {
    const owner = {
      [CommentType.COMMENT]: "commenter",
      [CommentType.REPLY]: "replier",
    };
    return (
      <div key={item.id}>
        <div className="mt-10">
          <hr />
          <div className="flex items-start mt-2">
            <Link as={`/u/${item[owner[commentType]]?.id}`} href="/u/[id]">
              <a>
                <img
                  className="w-12 h-12 border-2 rounded-full object-cover"
                  src={item[owner[commentType]]?.avatar?.url + AVATAR_SM}
                  alt={item[owner[commentType]]?.username}
                />
              </a>
            </Link>
            <div className="w-full flex-1 max-w-2xl text-sm pl-2">
              <Link as={`/u/${item[owner[commentType]]?.id}`} href="/u/[id]">
                <a className="text-sm text-gray-700">
                  {item[owner[commentType]]?.username}
                  {item.isOwnership && (
                    <span className="ml-2 text-xs px-1 py-0 rounded-sm text-red-300 border-2 border-red-300">
                      作者
                    </span>
                  )}
                  {item[owner[commentType]]?.id === user.id && (
                    <span className="ml-2 text-xs px-1 py-0 rounded-sm text-blue-300 border-2 border-red-300">
                      我
                    </span>
                  )}
                </a>
              </Link>
              <div className="mt-1 text-xs text-gray-500">
                <Date
                  dateString={item.createdAt}
                  dayType={DayTypeEnum.FROMNOW}
                />
              </div>
              <p className="mt-2 text-gray-700">{item.content}</p>
              {user.username && (
                <div className="mt-2 text-gray-600">
                  <span
                    className={classNames("hover:opacity-75 cursor-pointer", {
                      "text-primary-1": item.likes?.find(
                        (v: { id: string }) => v.id === user.id
                      ),
                    })}
                    onClick={() => {
                      like(item.id, comentIndex, replyIndex);
                    }}
                  >
                    <svg
                      className="h-4 w-4 inline-block"
                      viewBox="0 0 24 24"
                      strokeWidth="2"
                      stroke="currentColor"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path stroke="none" d="M0 0h24v24H0z" />
                      <path d="M7 11v 8a1 1 0 0 1 -1 1h-2a1 1 0 0 1 -1 -1v-7a1 1 0 0 1 1 -1h3a4 4 0 0 0 4 -4v-1a2 2 0 0 1 4 0v5h3a2 2 0 0 1 2 2l-1 5a2 3 0 0 1 -2 2h-7a3 3 0 0 1 -3 -3" />
                    </svg>
                    <small>{item.likesCount}</small>
                  </span>
                  <span
                    className="ml-2 cursor-pointer"
                    onClick={() => {
                      let optionalReplyRelated = {
                        replyParentId: "",
                        replyParentUsername: "",
                      };
                      if (commentType === CommentType.REPLY) {
                        optionalReplyRelated = {
                          replyParentId: item.id,
                          replyParentUsername: `@${
                            item[owner[commentType]].username
                          } `,
                        };
                      }
                      setContentState({
                        [commentId]: {
                          content: contentState[commentId]?.content ?? "",
                          ...optionalReplyRelated,
                        },
                      });
                      // dom未渲染,使用setTimeout延迟一下
                      setTimeout(() => {
                        textareaRef.current?.focus();
                      }, 0);
                    }}
                  >
                    回复
                  </span>
                </div>
              )}
              {item?.replies?.map((reply: any, replyIndex: number) =>
                commentCard(
                  reply,
                  CommentType.REPLY,
                  item.id,
                  comentIndex,
                  replyIndex
                )
              )}
            </div>
          </div>
        </div>
        {commentType === CommentType.COMMENT && (
          <>
            <div className="mt-10">
              <hr />
              <div className="mt-2 text-gray-600">
                <span className="cursor-pointer">
                  <svg
                    className="h-4 w-4 inline-block"
                    viewBox="0 0 24 24"
                    strokeWidth="2"
                    stroke="currentColor"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                  <span
                    className="ml-1"
                    onClick={() => {
                      setContentState({
                        [item.id]: {
                          content: contentState[item.id]?.content ?? "",
                          replyParentId: "",
                          replyParentUsername: "",
                        },
                      });
                      // dom未渲染,使用setTimeout延迟一下
                      setTimeout(() => {
                        textareaRef.current?.focus();
                      }, 0);
                    }}
                  >
                    对 {item[owner[commentType]]?.username} 说
                  </span>
                </span>
              </div>
            </div>
            {contentState[item.id] && commentTextareaBox(item.id)}
          </>
        )}
      </div>
    );
  };

  return (
    <>
      <div className="">
        {commentTextareaBox("new")}
        <h3 className="border-l-4 border-primary-1 p-2">
          <div className="flex justify-between items-center">
            <div>
              <span>全部评论</span>
              <span className="ml-1 text-sm">{total}</span>
            </div>
            {total > 0 && (
              <div>
                <button
                  className={classNames(
                    "px-2 py-1 border-b-2 border-gray-400 text-gray-500 hover:opacity-75 focus:outline-none hover:opacity-75 text-xs",
                    {
                      "border-primary-1 text-primary-1":
                        sortState === SortEnum.DESC,
                    }
                  )}
                  onClick={getComments.bind(
                    null,
                    SortEnum.DESC,
                    /* startAgain */ true
                  )}
                >
                  最新排序
                </button>{" "}
                <button
                  className={classNames(
                    "px-2 py-1 border-b-2 border-gray-400 text-gray-500 hover:opacity-75 focus:outline-none hover:opacity-75 text-xs",
                    {
                      "border-primary-1 text-primary-1":
                        sortState === SortEnum.ASC,
                    }
                  )}
                  onClick={getComments.bind(
                    null,
                    SortEnum.ASC,
                    /* startAgain */ true
                  )}
                >
                  最旧排序
                </button>
              </div>
            )}
          </div>
        </h3>
        {commentsState.map((comment, comentIndex: number) =>
          commentCard(comment, CommentType.COMMENT, comment.id, comentIndex)
        )}
      </div>
      <style jsx>{``}</style>
    </>
  );
};
export default Comment;
