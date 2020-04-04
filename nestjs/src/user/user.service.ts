import {
  Injectable,
  InternalServerErrorException,
  BadRequestException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity, UserStatusEnum } from './user.entity';
import { Repository } from 'typeorm';
import { validate } from 'class-validator';
import { ParamDTO, IdParamDTO } from '@src/shared/shared.dto';
import {
  paginate,
  Pagination,
  IPaginationOptions,
} from 'nestjs-typeorm-paginate';
import { UpdateUserDTO } from './user.dto';

@Injectable()
export class UserService {
  private readonly logger: Logger = new Logger(UserService.name);
  private readonly relations = ['articles', 'bookmarks', 'likeArticles'];
  private readonly table = 'user';

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
   * @param {(ParamDTO | IdParamDTO)} userParamDTO
   * @param {boolean} [returnsUserEntity=false]
   * @returns
   * @memberof UserService
   */
  async findOneByuuidForUser(
    userParamDTO: ParamDTO | IdParamDTO,
    returnsUserEntity: boolean = false,
  ) {
    let user: UserEntity;
    if ((userParamDTO as ParamDTO).uuid) {
      const { uuid } = <ParamDTO>userParamDTO;
      user = await this.userRepository.findOne(
        { uuid },
        {
          relations: this.relations,
        },
      );
    } else if ((userParamDTO as IdParamDTO).id) {
      const { id } = <IdParamDTO>userParamDTO;
      user = await this.userRepository.findOne(id, {
        relations: this.relations,
      });
    } else {
      throw new BadRequestException('亲，传入的参数不正确');
    }

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
   * @date 2020-03-16
   * @param {boolean} [returnsUserEntity=false]
   * @returns
   * @memberof UserService
   */
  async findAll(returnsUserEntity: boolean = false) {
    const users = await this.userRepository.find({
      relations: this.relations,
    });
    if (returnsUserEntity) {
      return users;
    }
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
  async findOne(paramDTO: ParamDTO | IdParamDTO) {
    return await this.findOneByuuidForUser(paramDTO);
  }

  /**
   * @description 注销账号
   * @author Saxon
   * @date 2020-03-11
   * @param {UserEntity} user
   * @returns
   * @memberof UserService
   */
  async destroy(user: UserEntity) {
    const { uuid } = user;
    await this.findOneByuuidForUser({ uuid });

    try {
      const destroyingUser = await this.userRepository.delete({ uuid });
      if (!destroyingUser.affected) {
        return '注销账号失败';
      }
      return '注销账号成功';
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(error.message, '服务器异常');
    }
  }

  /**
   * @description 给article服务层调用
   * @author Saxon
   * @date 2020-03-12
   * @param {UserEntity} user
   * @returns
   * @memberof UserService
   */
  async bookmark(user: UserEntity) {
    return await this.userRepository.save(user);
  }

  /** ------------------------------------ADMIN------------------------------------------ */

  /**
   * @description 查询所有[后台接口]
   * @author Saxon
   * @date 2020-04-03
   * @param {IPaginationOptions} options
   * @returns
   * @memberof UserService
   */
  async findAllForAdmin(options: IPaginationOptions) {
    const queryBuilder = this.userRepository.createQueryBuilder(this.table);
    for (const item of this.relations) {
      queryBuilder.leftJoinAndSelect(`${this.table}.${item}`, item);
    }
    const users: Pagination<UserEntity> = await paginate<UserEntity>(
      queryBuilder,
      options,
    );
    return {
      ...users,
      items: users.items.map(v => v.toResponseObject(/**isAdminSide */ true)),
    };
  }

  async updateForAdmin(idParamDTO: IdParamDTO, userDTO: UpdateUserDTO) {
    const { id } = idParamDTO;
    const { status } = userDTO;
    const user: UserEntity = await this.findOneByuuidForUser(
      idParamDTO,
      /* returnsUserEntity */ true,
    );

    switch (status) {
      case UserStatusEnum.DISABLED:
        userDTO.status = UserStatusEnum.DISABLED;
        break;
      case UserStatusEnum.NORMAL:
        userDTO.status = UserStatusEnum.NORMAL;
        break;
      default:
        throw new BadRequestException('亲，传入的参数不正确');
    }

    try {
      const updatingAticle = await this.userRepository.update(id, userDTO);
      if (!updatingAticle.affected) {
        return '更新失败';
      }
      return null;
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(error.message, '服务器异常');
    }
  }
}
