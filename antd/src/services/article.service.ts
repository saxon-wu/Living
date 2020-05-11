import request from '@/utils/request.living';
import { IPagination } from '@/shared/pagination.interface';

export async function queryArticlesService(params: IPagination): Promise<any> {
  return await request('/admin/articles', {
    params,
  });
}

export async function updateArticleService(params): Promise<any> {
  const { id, data } = params;
  return await request(`/admin/article/${id}`, {
    method: 'PUT',
    data,
  });
}
