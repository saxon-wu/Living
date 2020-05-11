import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { UserService } from '@src/user/user.service';
import { IdParamDTO, UUIDParamDTO } from './shared.dto';
import { isUUID } from 'class-validator';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly userService: UserService,
    private readonly configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const decode: any = this.validateRequest(request.headers.authorization);

    const idOrUUID = decode.id;
    let param: any = {};
    if (
      isUUID(idOrUUID, this.configService.get('UUID_VERSION'))
    ) {
      (param as UUIDParamDTO).uuid = idOrUUID;
    } else {
      (param as IdParamDTO).id = idOrUUID;
    }

    // request.user是内部使用的，所以findOneByuuidForUser返回UserEntity类型更方便，比如关联存储
    request.user = await this.userService.findOneForUser(param, true);
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
      throw new UnauthorizedException('亲，没有令牌');
    }
    if (authorization.split(' ')[0] !== 'Bearer') {
      throw new UnauthorizedException('亲，无效令牌');
    }
    const token = authorization.split(' ')[1];

    try {
      const decode = jwt.verify(token, process.env.JWT_SECRET_KEY);
      return decode;
    } catch (error) {
      throw new UnauthorizedException(error);
    }
  }
}
