import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response, request } from 'express';
import * as jwt from 'jsonwebtoken';
import { UserService } from '@src/user/user.service';
import { ConfigService } from '@nestjs/config';
import { isUUID } from 'class-validator';
import { UUIDParamDTO, IdParamDTO } from './shared.dto';

/**
 * @description 与AuthGuard不同，本Middleware不强制，如果用户已登录则取到身份
 * @author Saxon
 * @date 2020-04-21
 * @export
 * @class AuthenticatorMiddleware
 * @implements {NestMiddleware}
 */
@Injectable()
export class AuthenticatorMiddleware implements NestMiddleware {
  constructor(
    private readonly userService: UserService,
    private readonly configService: ConfigService,
  ) {}

  async use(req: Request, res: Response, next: Function) {
    const decode: any = this.validateRequest(req.headers.authorization);
    if (decode) {
      const idOrUUID = decode.id;
      let param: any = {};
      if (isUUID(idOrUUID, this.configService.get('UUID_VERSION'))) {
        (param as UUIDParamDTO).id = idOrUUID;
      } else {
        (param as IdParamDTO).id = idOrUUID;
      }

      // request.user是内部使用的，所以findOneByuuidForUser返回UserEntity类型更方便，比如关联存储
      (<any>req).user = await this.userService.findOneForUser(param);
    }
    next();
  }
  validateRequest(authorization: string) {
    if (authorization && authorization.split(' ')[0] === 'Bearer') {
      const token = authorization.split(' ')[1];

      try {
        const decode = jwt.verify(token, process.env.JWT_SECRET_KEY);
        return decode;
      } catch (error) {
        throw new UnauthorizedException(error);
      }
    }
    return null;
  }
}
