import request from "../request";
import { SortEnum } from "../enum";

/**获取评论列表 */
export async function queryCommentsService(params: {
  id: string;
  current: number;
  pageSize: number;
  sort: SortEnum;
}): Promise<any> {
  const { id } = params;
  return await request()(`/comments/article/${id}`, {
    params,
  });
}

/**对评论点赞 */
export async function likeCommentService(params: { id: string }): Promise<any> {
  const { id } = params;
  return await request()(`/comment/${id}/like`, {
    method: "POST",
  });
}

/**对回复点赞 */
export async function likeReplyService(params: { id: string }): Promise<any> {
  const { id } = params;
  return await request()(`/reply/${id}/like`, {
    method: "POST",
  });
}

/** 发表新评论 */
export async function createCommentService(params: {
  data: {
    content: string;
    articleId: string;
  };
}): Promise<any> {
  const { data } = params;
  return await request()(`/comment`, {
    method: "POST",
    data,
  });
}

/** 评论"评论"或回复"回复" */
export async function createReplyService(params: {
  data: {
    content: string;
    commentId: string;
    replyParentId?: string;
  };
}): Promise<any> {
  const { data } = params;
  return await request()(`/reply`, {
    method: "POST",
    data,
  });
}
