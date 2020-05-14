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
import { UUIDParamDTO } from '@src/shared/shared.dto';
import {
  paginate,
  Pagination,
  IPaginationOptions,
} from 'nestjs-typeorm-paginate';
import { CreateTagDTO, UpdateTagDTO } from './tag.dto';
import { UserEntity } from '@src/user/user.entity';
import { ITagOutput } from './tag.interface';
import { transformRelations } from '@src/shared/helper.util';

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
  private infiniteRecursion(data: TagEntity[], starting: string): TagEntity[] {
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
   * @param {UUIDParamDTO} paramDTO
   * @returns {Promise<TagEntity>}
   * @memberof TagService
   */
  async findOneForTag(paramDTO: UUIDParamDTO): Promise<TagEntity> {
    let tag: TagEntity;
    const { id } = <UUIDParamDTO>paramDTO;
    tag = await this.tagRepository.findOne(id, {
      relations: this.relations,
    });

    if (!tag) {
      throw new NotFoundException('标签不存在');
    }

    return tag;
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
  ): Promise<Pagination<TagEntity>> {
    const queryBuilder = this.tagRepository.createQueryBuilder(this.table);
    for (const item of transformRelations(this.table, this.relations)) {
      queryBuilder.leftJoinAndSelect(item.property, item.alias);
    }
    const tags: Pagination<TagEntity> = await paginate<TagEntity>(
      queryBuilder,
      options,
    );

    return tags;
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
  async create(tagDTO: CreateTagDTO, user: UserEntity): Promise<TagEntity> {
    const { name, describe, parentId } = tagDTO;
    const tag = await this.tagRepository.findOne({ name });

    if (tag) {
      throw new ConflictException('标签已存在');
    }

    const creatingTag = this.tagRepository.create({
      name: name.toLowerCase(),
      describe,
    });

    creatingTag.creator = user;

    try {
      const savingTag = await this.tagRepository.save(creatingTag);
      return savingTag;
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
  ): Promise<Pagination<TagEntity>> {
    const queryBuilder = this.tagRepository.createQueryBuilder(this.table);
    for (const item of transformRelations(this.table, this.relations)) {
      queryBuilder.leftJoinAndSelect(item.property, item.alias);
    }
    let tags: Pagination<TagEntity> = await paginate<TagEntity>(
      queryBuilder,
      options,
    );
    /* tag.items 是readonly，断言即可 */
    (tags.items as TagEntity[]) = this.infiniteRecursion(tags.items, '');

    return tags;
  }

  /**
   * @description 更新
   * @author Saxon
   * @date 2020-04-11
   * @param {UUIDParamDTO} paramDTO
   * @param {UpdateTagDTO} tagDTO
   * @param {UserEntity} user
   * @returns {(Promise<TagEntity | string>)}
   * @memberof TagService
   */
  async updateForAdmin(
    paramDTO: UUIDParamDTO,
    tagDTO: UpdateTagDTO,
    user: UserEntity,
  ): Promise<TagEntity | string> {
    const { name, describe } = tagDTO;
    if (!name && !describe) {
      throw new BadRequestException('亲，参数不可为空');
    }
    const tag = <TagEntity>await this.findOneForTag(paramDTO);

    if (
      (tag.name === name && tag.describe === describe) ||
      (!name && tag.describe === describe) ||
      (!describe && tag.name === name)
    ) {
      throw new BadRequestException('亲，请修改后再提交');
    }

    try {
      const updatingTag = await this.tagRepository.update(tag.id, {
        name,
        describe,
      });

      if (!updatingTag.affected) {
        return '更新失败';
      }
      return <TagEntity>await this.findOneForTag(paramDTO);
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
  async destroy(ids: string[]): Promise<string> {
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
