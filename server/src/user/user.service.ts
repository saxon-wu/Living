import {
  Injectable,
  InternalServerErrorException,
  BadRequestException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from './user.entity';
import { Repository } from 'typeorm';
import { CreateUserDTO } from './user.dto';
import { validate } from 'class-validator';
import { ParamDTO } from 'src/shared/shared.dto';

@Injectable()
export class UserService {
  private readonly logger: Logger = new Logger(UserService.name);

  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  /**
   * @description 验证器，传入的参数与entity中的字段验证比对，比对依据来自entity中的class-validator装饰器
   * @author Saxon
   * @date 2020-03-11
   * @private
   * @param {UserEntity} object
   * @memberof UserService
   */
  private async validator(object: UserEntity) {
    const errors = await validate(object);
    if (errors.length > 0) {
      throw new BadRequestException(errors, '验证失败');
    }
  }

  /**
   * @description 依据uuid查询一条数据，不存在则抛出404，公共调用
   * @author Saxon
   * @date 2020-03-11
   * @param {ParamDTO} paramDTO
   * @param {boolean} [returnsUserEntity=false]
   * @returns
   * @memberof UserService
   */
  async findOneByuuidForUser(
    paramDTO: ParamDTO,
    returnsUserEntity: boolean = false,
  ) {
    const { uuid } = paramDTO;
    const user = await this.userRepository.findOne(
      { uuid },
      {
        relations: ['articles'],
      },
    );
    if (!user) {
      throw new NotFoundException('用户不存在');
    }
    if (returnsUserEntity) {
      return user;
    }
    return user.toResponseObject();
  }

  /**
   * @description 查询所有
   * @author Saxon
   * @date 2020-03-11
   * @returns
   * @memberof UserService
   */
  async findAll() {
    const users = await this.userRepository.find({
      relations: ['articles'],
    });
    return users.map(v => v.toResponseObject());
  }

  /**
   * @description 查询一条
   * @author Saxon
   * @date 2020-03-11
   * @param {ParamDTO} paramDTO
   * @returns
   * @memberof UserService
   */
  async findOne(paramDTO: ParamDTO) {
    return await this.findOneByuuidForUser(paramDTO);
  }

  /**
   * @description 注销账号
   * @author Saxon
   * @date 2020-03-11
   * @param {*} user
   * @returns
   * @memberof UserService
   */
  async destroy(user) {
    const { uuid } = user;
    await this.findOneByuuidForUser({ uuid });
    
    try {
      const destroyed = await this.userRepository.delete({ uuid });
      if (!destroyed.affected) {
        return '注销账号失败';
      }
      return '注销账号成功';
    } catch (error) {
      this.logger.error(error)
      throw new InternalServerErrorException(error.message, '服务器异常');
    }
  }
}
