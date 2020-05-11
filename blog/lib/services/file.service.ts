import request from "../request";

/** 文件上传 */
export async function uploadByFileService(params: {
  data: any;
}): Promise<any> {
  const { data } = params;
  return await request()(`/file/uploadByFile`, {
    method: "POST",
    data,
  });
}

/** url上传 */
export async function uploadByUrlService(params: {
  data: any;
}): Promise<any> {
  const { data } = params;
  return await request()(`/file/uploadByUrl`, {
    method: "POST",
    data,
  });
}