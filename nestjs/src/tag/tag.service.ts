import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { TagEntity } from './tag.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, UpdateResult, DeleteResult } from 'typeorm';
import { ArticleService } from '@src/article/article.service';
import { UUIDParamDTO, IdParamDTO } from '@src/shared/shared.dto';
import {
  paginate,
  Pagination,
  IPaginationOptions,
} from 'nestjs-typeorm-paginate';
import { CreateTagDTO, UpdateTagDTO } from './tag.dto';
import { UserEntity } from '@src/user/user.entity';
import { ITagOutput } from './tag.interface';

@Injectable()
export class TagService {
  private readonly logger: Logger = new Logger(TagService.name);
  private readonly relations = ['creator', 'articles'];
  private readonly table = 'tag';

  constructor(
    @InjectRepository(TagEntity)
    private readonly tagRepository: Repository<TagEntity>, // private readonly articleService: ArticleService,
  ) {}

  /**
   * @description 无限递归
   * @author Saxon
   * @date 2020-04-12
   * @private
   * @param {TagEntity[]} data
   * @param {number} starting
   * @returns {TagEntity[]}
   * @memberof TagService
   */
  private infiniteRecursion(data: TagEntity[], starting: number): TagEntity[] {
    return (function x(id) {
      return data
        .filter(v => v.parentId === id)
        .map(v => {
          v.children = x(v.id).length ? x(v.id) : null;
          return v;
        });
    })(starting);
  }

  /**
   * @description 依据uuid查询一条数据，不存在则抛出404，公共调用
   * @author Saxon
   * @date 2020-04-11
   * @param {(UUIDParamDTO | IdParamDTO)} paramDTO
   * @param {boolean} [returnsEntity=false]
   * @returns {(Promise<TagEntity | ITagOutput>)}
   * @memberof TagService
   */
  async findOneForTag(
    paramDTO: UUIDParamDTO | IdParamDTO,
    returnsEntity: boolean = false,
  ): Promise<TagEntity | ITagOutput> {
    let tag: TagEntity;
    if ((paramDTO as UUIDParamDTO).uuid) {
      const { uuid } = <UUIDParamDTO>paramDTO;
      tag = await this.tagRepository.findOne(
        { uuid },
        {
          relations: this.relations,
        },
      );
    } else if ((paramDTO as IdParamDTO).id) {
      const { id } = <IdParamDTO>paramDTO;
      tag = await this.tagRepository.findOne(id, {
        relations: this.relations,
      });
    } else {
      throw new BadRequestException('亲，传入的参数不正确');
    }

    if (!tag) {
      throw new NotFoundException('标签不存在');
    }

    // this.parentChildRelation(tag.replies);

    if (returnsEntity) {
      return tag;
    }
    return tag.toResponseObject();
  }

  /**
   * @description 查询所有
   * @author Saxon
   * @date 2020-04-11
   * @param {IPaginationOptions} options
   * @param {boolean} [isAdminSide=false]
   * @returns {Promise<Pagination<ITagOutput>>}
   * @memberof TagService
   */
  async findAll(
    options: IPaginationOptions,
    isAdminSide: boolean = false,
  ): Promise<Pagination<ITagOutput>> {
    const queryBuilder = this.tagRepository.createQueryBuilder(this.table);
    for (const item of this.relations) {
      queryBuilder.leftJoinAndSelect(`${this.table}.${item}`, item);
    }
    const tags: Pagination<TagEntity> = await paginate<TagEntity>(
      queryBuilder,
      options,
    );
    if (isAdminSide) {
      return {
        ...tags,
        items: tags.items.map(v => v.toResponseObject(/**isAdminSide */ true)),
      };
    }
    return {
      ...tags,
      items: tags.items.map(v => v.toResponseObject()),
    };
  }

  /**
   * @description 创建
   * @author Saxon
   * @date 2020-04-11
   * @param {CreateTagDTO} tagDTO
   * @param {UserEntity} user
   * @returns {Promise<ITagOutput>}
   * @memberof TagService
   */
  async create(tagDTO: CreateTagDTO, user: UserEntity): Promise<ITagOutput> {
    const { name, describe, parentId } = tagDTO;
    const tag = await this.tagRepository.findOne({ name });

    if (tag) {
      throw new ConflictException('标签已存在');
    }
    tagDTO.name = name.toLowerCase();
    const creatingTag = this.tagRepository.create(tagDTO);

    creatingTag.creator = user;

    try {
      const savingTag = await this.tagRepository.save(creatingTag);
      return savingTag.toResponseObject();
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(error.message, '服务器异常');
    }
  }

  /** ------------------------------------ADMIN------------------------------------------ */

  /**
   * @description 查询所有 后台
   * @author Saxon
   * @date 2020-04-12
   * @param {IPaginationOptions} options
   * @param {boolean} [isAdminSide=false]
   * @returns {Promise<Pagination<ITagOutput>>}
   * @memberof TagService
   */
  async findAllForAdmin(
    options: IPaginationOptions,
    isAdminSide: boolean = false,
  ): Promise<Pagination<ITagOutput>> {
    const queryBuilder = this.tagRepository.createQueryBuilder(this.table);
    for (const item of this.relations) {
      queryBuilder.leftJoinAndSelect(`${this.table}.${item}`, item);
    }
    let tags: Pagination<TagEntity> = await paginate<TagEntity>(
      queryBuilder,
      options,
    );
    /* tag.items 是readonly，断言即可 */
    (tags.items as TagEntity[]) = this.infiniteRecursion(tags.items, 0);

    if (isAdminSide) {
      return {
        ...tags,
        items: tags.items.map(v => v.toResponseObject(/**isAdminSide */ true)),
      };
    }
    return {
      ...tags,
      items: tags.items.map(v => v.toResponseObject()),
    };
  }

  /**
   * @description 更新
   * @author Saxon
   * @date 2020-04-11
   * @param {(UUIDParamDTO | IdParamDTO)} paramDTO
   * @param {UpdateTagDTO} tagDTO
   * @param {UserEntity} user
   * @returns {(Promise<ITagOutput | string>)}
   * @memberof TagService
   */
  async updateForAdmin(
    paramDTO: UUIDParamDTO | IdParamDTO,
    tagDTO: UpdateTagDTO,
    user: UserEntity,
  ): Promise<ITagOutput | string> {
    const { name, describe } = tagDTO;
    if (!name && !describe) {
      throw new BadRequestException('亲，参数不可为空');
    }
    const tag = <TagEntity>(
      await this.findOneForTag(paramDTO, /* returnsEntity */ true)
    );

    if (
      (tag.name === name && tag.describe === describe) ||
      (!name && tag.describe === describe) ||
      (!describe && tag.name === name)
    ) {
      throw new BadRequestException('亲，请修改后再提交');
    }

    try {
      const updatingTag = await this.tagRepository.update(tag.id, tagDTO);

      if (!updatingTag.affected) {
        return '更新失败';
      }
      return <ITagOutput>await this.findOneForTag(paramDTO);
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(error.message, '服务器异常');
    }
  }

  /**
   * @description 删除，物理删除
   * @author Saxon
   * @date 2020-04-11
   * @param {number[]} ids
   * @returns {Promise<string>}
   * @memberof TagService
   */
  async destroy(ids: number[]): Promise<string> {
    for (const id of ids) {
      const tag = await this.tagRepository.findOne({ parentId: id });
      if (tag?.id) {
        throw new ConflictException('请先删除子标签');
      }
    }
    
    try {
      const deletingTag: DeleteResult = await this.tagRepository.delete(ids);

      if (!deletingTag.affected) {
        return '删除失败';
      }
      return `删除 id:${ids}，${deletingTag.affected}条成功，${ids.length -
        deletingTag.affected}条失败`;
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(error.message, '服务器异常');
    }
  }
}
