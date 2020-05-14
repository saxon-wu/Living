import {
  Injectable,
  Logger,
  ConflictException,
  InternalServerErrorException,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '@src/user/user.entity';
import { Repository } from 'typeorm';
import { LoginDTO } from './auth.dto';
import { FileService } from '@src/file/file.service';
import { NOT_FOUND_IMAGE } from '@src/shared/constant';
import { FilePurposeEnum } from '@src/file/file.enum';
import { IFileProperty } from '@src/file/file.interface';
import { classToPlain } from 'class-transformer';
import { UserStatusEnum } from '@src/user/user.enum';

@Injectable()
export class AuthService {
  private readonly logger: Logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly fileService: FileService,
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
    const user = await this.userRepository.findOne(
      { username },
      {
        relations: ['avatar'],
      },
    );
    if (!user || !user.comparePassword(password)) {
      throw new UnauthorizedException('亲，用户或密码不正确');
    }

    if (user.status !== UserStatusEnum.NORMAL) {
      throw new ForbiddenException('亲，您的账号已被禁用');
    }

    const _user = classToPlain(user);
    return { ..._user, ...user.tokenObject };
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

      const fileProperty = <IFileProperty>(
        await this.fileService.makePlaceholder(
          username,
          /*filename*/ null,
          /*returnFileProperty*/ true,
        )
      );

      const avatar = await this.fileService.createSingleByFile(
        { ...fileProperty, uploader: savingUser },
        { purpose: FilePurposeEnum.AVATAR },
        savingUser,
      );
      // 返回给用户
      savingUser.avatar = avatar;

      const updating = await this.userRepository.update(savingUser.id, {
        avatar,
      });
      if (updating.affected) {
        const _savingUser = classToPlain(savingUser);
        return { ..._savingUser, ...savingUser.tokenObject };
      }
      return '随机默认头像关联失败，更新头像即可';
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(error.message, '服务器异常');
    }
  }
}
