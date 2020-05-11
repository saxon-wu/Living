import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { classToPlain } from 'class-transformer';
import * as _ from 'lodash';
import { map } from 'rxjs/operators';

@Injectable()
export class TransformInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    const ctx = context.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const now = Date.now();

    let message: string = '请求成功';
    switch (request.method) {
      case 'GET':
        message = '获取成功';
        break;
      case 'POST':
        message = '创建成功';
        break;
      case 'PUT':
        message = '更新成功';
        break;
      case 'DELETE':
        message = '删除成功';
        break;
    }
    return next.handle().pipe(
      map((data: any) => {
        // 当data是string类型，说明是提示信息，应当交给message
        let results: any;
        if (typeof data === 'string') {
          message = data;
          results = null;
        } else {
          results = classToPlain(data);
        }
        const obj = {
          statusCode: 0,
          responseTime: `${Date.now() - now}ms`,
          message,
          results,
        };
        if (data?.message) {
          obj.message = data.message;
          delete data.message;
          // lodash 的isEmpty 检查 value 是否为一个空对象，集合，映射或者set。数字和boolean都是true
          obj.results = _.isEmpty(data) ? null : classToPlain(data);
        }
        return obj;
      }),
    );
  }
}
