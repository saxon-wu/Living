import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { UserService } from '@src/user/user.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly userService: UserService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const decode: any = this.validateRequest(request.headers.authorization);
    // request.user是内部使用的，所以findOneByuuidForUser返回UserEntity类型更方便，比如关联存储
    request.user = await this.userService.findOneByuuidForUser(
      { uuid: decode.id },
      true,
    );

    return true;
  }

  /**
   * @description 验证客户端传入的Authorization
   * @author Saxon
   * @date 2020-03-11
   * @param {string} authorization
   * @returns
   * @memberof AuthGuard
   */
  validateRequest(authorization: string) {
    if (!authorization) {
      throw new ForbiddenException('亲，没有令牌');
    }
    if (authorization.split(' ')[0] !== 'Bearer') {
      throw new ForbiddenException('亲，无效令牌');
    }
    const token = authorization.split(' ')[1];

    try {
      const decode = jwt.verify(token, process.env.JWT_SECRET_KEY);
      return decode;
    } catch (error) {
      throw new ForbiddenException(error);
    }
  }
}
