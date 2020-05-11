import request from '@/utils/request.living';

export interface LoginParamsType {
  username: string;
  password: string;
  mobile: string;
  captcha: string;
}

export async function accountLogin(params: LoginParamsType) {
  return await request('/auth/login', {
    method: 'POST',
    data: params,
  });
}

export async function getFakeCaptcha(mobile: string) {
  return await request(`/api/login/captcha?mobile=${mobile}`);
}
