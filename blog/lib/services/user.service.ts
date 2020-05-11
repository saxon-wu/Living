import request from "../request";

/**获取当前用户信息 */
export async function queryWhoamiUserService(): Promise<any> {
  return await request()("/user/whoami/x");
}

/**获取单个用户信息 */
export async function queryUserService(params: { id: string; }): Promise<any> {
  const { id } = params;
  return await request()(`/user/${id}`);
}
