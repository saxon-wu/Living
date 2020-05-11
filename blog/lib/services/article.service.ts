import request from "../request";
import { BaseContext } from "next/dist/next-server/lib/utils";

/**获取文章列表 */
export async function queryArticlesService(params: {
  current: number;
  pageSize: number;
}): Promise<any> {
  return await request()("/articles", {
    params,
  });
}

/**获取单篇文章 */
export async function queryArticleService(
  id: string,
  ctx?: BaseContext
): Promise<any> {
  return await request(ctx)(`/article/${id}`);
}

/**发布文章 */
export async function createArticleService(params: {
  data: any;
}): Promise<any> {
  const { data } = params;
  return await request()(`/article`, {
    method: "POST",
    data,
  });
}

/**更新文章 */
export async function updateArticleService(params: {
  id: any;
  data: any;
}): Promise<any> {
  const { id, data } = params;
  return await request()(`/article/${id}`, {
    method: "PUT",
    data,
  });
}
