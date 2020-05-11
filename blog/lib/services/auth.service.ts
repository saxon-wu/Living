import request from "../request";

export async function login(params: { data: any }): Promise<any> {
  const { data } = params;
  return await request()(`/auth/login`, {
    method: "POST",
    data,
  });
}

export async function register(params: { data: any }): Promise<any> {
  const { data } = params;
  return await request()(`/auth/register`, {
    method: "POST",
    data,
  });
}
