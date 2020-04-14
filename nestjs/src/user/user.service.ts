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
import { validate } from 'class-validator';
import { UUIDParamDTO, IdParamDTO } from '@src/shared/shared.dto';
import {
  paginate,
  Pagination,
  IPaginationOptions,
} from 'nestjs-typeorm-paginate';
import { UpdateUserDTO } from './user.dto';
import { UserStatusEnum } from './user.enum';
import { IUserOutput } from './user.interface';

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
   * @returns {Promise<void>}
   * @memberof UserService
   */
  private async validator(object: UserEntity): Promise<void> {
    const errors = await validate(object);
    if (errors.length > 0) {
      throw new BadRequestException(errors, '验证失败');
    }
  }

  /**
   * @description 依据uuid查询一条数据，不存在则抛出404，公共调用
   * @author Saxon
   * @date 2020-03-11
   * @param {(UUIDParamDTO | IdParamDTO)} userParamDTO
   * @param {boolean} [returnsEntity=false]
   * @returns {(Promise<UserEntity | IUserOutput>)}
   * @memberof UserService
   */
  async findOneForUser(
    userParamDTO: UUIDParamDTO | IdParamDTO,
    returnsEntity: boolean = false,
  ): Promise<UserEntity | IUserOutput> {
    let user: UserEntity;
    if ((userParamDTO as UUIDParamDTO).uuid) {
      const { uuid } = <UUIDParamDTO>userParamDTO;
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
    if (returnsEntity) {
      return user;
    }
    return user.toResponseObject();
  }

  /**
   * @description 查询所有
   * @author Saxon
   * @date 2020-03-16
   * @param {IPaginationOptions} options
   * @param {boolean} [isAdminSide=false]
   * @returns {Promise<Pagination<IUserOutput>>}
   * @memberof UserService
   */
  async findAll(
    options: IPaginationOptions,
    isAdminSide: boolean = false,
  ): Promise<Pagination<IUserOutput>> {
    const queryBuilder = this.userRepository.createQueryBuilder(this.table);
    for (const item of this.relations) {
      queryBuilder.leftJoinAndSelect(`${this.table}.${item}`, item);
    }
    const users: Pagination<UserEntity> = await paginate<UserEntity>(
      queryBuilder,
      options,
    );
    if (isAdminSide) {
      return {
        ...users,
        items: users.items.map(v => v.toResponseObject(/**isAdminSide */ true)),
      };
    }

    return {
      ...users,
      items: users.items.map(v => v.toResponseObject()),
    };
  }

  /**
   * @description 查询一条
   * @author Saxon
   * @date 2020-03-11
   * @param {(UUIDParamDTO | IdParamDTO)} paramDTO
   * @param {boolean} [returnsEntity=false]
   * @returns {(Promise<UserEntity | IUserOutput>)}
   * @memberof UserService
   */
  async findOne(
    paramDTO: UUIDParamDTO | IdParamDTO,
    returnsEntity: boolean = false,
  ): Promise<UserEntity | IUserOutput> {
    return await this.findOneForUser(paramDTO, returnsEntity);
  }

  /**
   * @description 注销账号
   * @author Saxon
   * @date 2020-03-11
   * @param {UserEntity} user
   * @returns {Promise<string>}
   * @memberof UserService
   */
  async destroy(user: UserEntity): Promise<string> {
    const { uuid } = user;
    const _user = await this.findOneForUser({ uuid });

    try {
      const destroyingUser = await this.userRepository.delete(_user.id);
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
   * @returns {Promise<UserEntity>}
   * @memberof UserService
   */
  async bookmark(user: UserEntity): Promise<UserEntity> {
    return await this.userRepository.save(user);
  }

  /** ------------------------------------ADMIN------------------------------------------ */

  /**
   * @description 更新[后台专用]
   * @author Saxon
   * @date 2020-04-03
   * @param {IdParamDTO} idParamDTO
   * @param {UpdateUserDTO} userDTO
   * @returns {Promise<string>}
   * @memberof UserService
   */
  async updateForAdmin(
    idParamDTO: IdParamDTO,
    userDTO: UpdateUserDTO,
  ): Promise<string> {
    const { id } = idParamDTO;
    const { status } = userDTO;
    <UserEntity>await this.findOneForUser(idParamDTO, /* returnsEntity */ true);

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
      return '更新成功';
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(error.message, '服务器异常');
    }
  }
}
