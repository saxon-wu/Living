import request from '@/utils/request.living';
import { IPagination } from '@/shared/pagination.interface';

export async function queryUsersService(params: IPagination): Promise<any> {
  return request('/admin/users', {
    params,
  });
}

export async function queryWhoamiService(): Promise<any> {
  return request('/admin/user/whoami/x');
}

export async function updateUserService(params): Promise<any> {
  const { id, data } = params;
  return request(`/admin/user/${id}`, {
    method: 'PUT',
    data,
  });
}

export async function queryNotices(): Promise<any> {
  return request('/api/notices');
}
