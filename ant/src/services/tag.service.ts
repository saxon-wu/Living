import request from '@/utils/request.living';
import { IPagination } from '@/shared/pagination.interface';

export async function queryTagsService(params: IPagination): Promise<any> {
  return await request('/admin/tags', {
    params,
  });
}

export async function createTagService(params): Promise<any> {
  const { data } = params;
  return await request(`/admin/tag`, {
    method: 'POST',
    data,
  });
}

export async function updateTagService(params): Promise<any> {
  const { id, data } = params;
  return await request(`/admin/tag/${id}`, {
    method: 'PUT',
    data,
  });
}

export async function deleteTagService(params): Promise<any> {
  const { ids } = params;
  console.log(ids);

  return await request(`/admin/tag/destruct`, {
    method: 'DELETE',
    params: {
      ids,
    },
  });
}
