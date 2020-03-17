import {
  Injectable,
  Logger,
  ConflictException,
  ForbiddenException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '@src/user/user.entity';
import { Repository } from 'typeorm';
import { LoginDTO } from './auth.dto';

@Injectable()
export class AuthService {
  private readonly logger: Logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  /**
   * @description 用户登录
   * @author Saxon
   * @date 2020-03-11
   * @param {LoginDTO} loginDTO
   * @returns
   * @memberof AuthService
   */
  async login(loginDTO: LoginDTO) {
    const { username, password } = loginDTO;
    const user = await this.userRepository.findOne({ username });
    if (!user || !user.comparePassword(password)) {
      throw new ForbiddenException('亲，用户或密码不正确');
    }
    return user.toResponseObject(false, true);
  }

  /**
   * @description 用户注册
   * @author Saxon
   * @date 2020-03-11
   * @param {LoginDTO} loginDTO
   * @returns
   * @memberof AuthService
   */
  async register(loginDTO: LoginDTO) {
    const { username, password } = loginDTO;
    const user = await this.userRepository.findOne({ username });
    if (user) {
      throw new ConflictException('亲，用户已存在');
    }

    const creatingUser = this.userRepository.create(loginDTO);

    try {
      const savingUser = await this.userRepository.save(creatingUser);

      return savingUser.toResponseObject(
        /* isAdminSide */ false,
        /* showToken */ true,
      );
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(error.message, '服务器异常');
    }
  }
}
