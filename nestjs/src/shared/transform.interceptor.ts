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
    
    const now = Date.now();

    return next.handle().pipe(
      map((data: any) => {
        const obj = {
          statusCode: 0,
          responseTime: `${Date.now() - now}ms`,
          message: '请求成功',
          result: classToPlain(data),
        };
        if (data?.message) {
          obj.message = data.message;
          delete data.message;
          // lodash 的isEmpty 检查 value 是否为一个空对象，集合，映射或者set。数字和boolean都是true
          obj.result = _.isEmpty(data) ? null : classToPlain(data);
        }
        return obj;
      }),
    );
  }
}
