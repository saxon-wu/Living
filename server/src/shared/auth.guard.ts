import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import * as jwt from 'jsonwebtoken';
import { UserService } from 'src/user/user.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly userService: UserService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const decode: any = this.validateRequest(request.headers.authorization);
    request.user = await this.userService.findOneByuuidForUser(decode.id);

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
