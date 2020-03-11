import {
  Injectable,
  InternalServerErrorException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from './user.entity';
import { Repository } from 'typeorm';
import { CreateUserDTO } from './user.dto';
import { validate } from 'class-validator';

@Injectable()
export class UserService {
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
   * @param {string} uuid
   * @returns
   * @memberof UserService
   */
  async findOneByuuidForUser(uuid: string) {
    const user = await this.userRepository.findOne({ uuid });
    if (!user) {
      throw new NotFoundException('用户不存在');
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
    const users = await this.userRepository.find();
    return users.map(v => v.toResponseObject());
  }

  /**
   * @description 查询一条
   * @author Saxon
   * @date 2020-03-11
   * @param {string} uuid
   * @returns
   * @memberof UserService
   */
  async findOne(uuid: string) {
    return await this.findOneByuuidForUser(uuid);
  }

  /**
   * @description 注销账号
   * @author Saxon
   * @date 2020-03-11
   * @param {string} uuid
   * @returns
   * @memberof UserService
   */
  async destroy(uuid: string) {
    await this.findOneByuuidForUser(uuid);
    const destroyed = await this.userRepository.delete({ uuid });
    if (!destroyed.affected) {
      return '删除失败';
    }
    return '删除成功';
  }
}
