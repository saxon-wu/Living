import {
  Injectable,
  Logger,
  InternalServerErrorException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FileEntity } from './file.entity';
import * as _ from 'lodash';
import { IFileOutput } from './file.interface';
import {
  IPaginationOptions,
  Pagination,
  paginate,
} from 'nestjs-typeorm-paginate';
import { UserEntity } from '@src/user/user.entity';
import { isEmpty } from 'lodash';
import { ConfigService } from '@nestjs/config';
import { join, resolve } from 'path';
import * as readChunk from 'read-chunk';
import * as fileType from 'file-type';
import * as fs from 'fs';
import { Response } from 'express';
import * as sharp from 'sharp';
import * as querystring from 'querystring';
import { CreateFileDTO, FilenameParamDTO } from './file.dto';
import { UserService } from '@src/user/user.service';
import { FilePurposeEnum } from './file.enum';
import { transformRelations } from '@src/shared/helper.util';
import { UUIDParamDTO, IdParamDTO } from '@src/shared/shared.dto';
import fetch from 'node-fetch';
import { MulterConfigService } from '@src/shared/multer-config.service';
import * as TextToSVG from 'text-to-svg';

@Injectable()
export class FileService {
  private readonly logger: Logger = new Logger(FileService.name);
  private readonly relations = ['uploader'];
  private readonly table = 'file';

  constructor(
    @InjectRepository(FileEntity)
    private readonly fileRepository: Repository<FileEntity>,
    private readonly configService: ConfigService,
    private readonly userService: UserService,
    private readonly multerConfigService: MulterConfigService,
  ) {}

  /**
   * @description 依据id,uuid,filename查询一条数据，不存在则抛出404，公共调用
   * @author Saxon
   * @date 2020-05-03
   * @param {(UUIDParamDTO | IdParamDTO | FilenameParamDTO)} paramDTO
   * @param {boolean} [returnsEntity=false]
   * @param {(UserEntity | null)} [user]
   * @returns {(Promise<FileEntity | IFileOutput>)}
   * @memberof FileService
   */
  async findOneForFile(
    paramDTO: UUIDParamDTO | IdParamDTO | FilenameParamDTO,
    returnsEntity: boolean = false,
    user?: UserEntity | null,
  ): Promise<FileEntity | IFileOutput> {
    let file: FileEntity;
    if ((paramDTO as FilenameParamDTO).filename) {
      const { filename } = <FilenameParamDTO>paramDTO;
      file = await this.fileRepository.findOne(
        { filename },
        {
          relations: this.relations,
        },
      );
    } else if ((paramDTO as UUIDParamDTO).uuid) {
      const { uuid } = <UUIDParamDTO>paramDTO;
      file = await this.fileRepository.findOne(
        { uuid },
        {
          relations: this.relations,
        },
      );
    } else if ((paramDTO as IdParamDTO).id) {
      const { id } = <IdParamDTO>paramDTO;
      file = await this.fileRepository.findOne(id, {
        relations: this.relations,
      });
    } else {
      throw new BadRequestException('亲，传入的参数不正确');
    }

    if (!file) {
      throw new NotFoundException('文件不存在');
    }

    if (returnsEntity) {
      return file;
    }
    return file.toResponseObject();
  }

  /**
   * @description 查询一条 输出给客户端
   * @author Saxon
   * @date 2020-05-03
   * @param {(UUIDParamDTO | IdParamDTO | FilenameParamDTO)} paramDTO
   * @param {(UserEntity | null)} [user]
   * @returns {(Promise<FileEntity | IFileOutput>)}
   * @memberof FileService
   */
  async findOne(
    paramDTO: UUIDParamDTO | IdParamDTO | FilenameParamDTO,
    user?: UserEntity | null,
  ): Promise<FileEntity | IFileOutput> {
    return await this.findOneForFile(paramDTO, /* returnsEntity */ false, user);
  }

  async findAll(
    options: IPaginationOptions,
    isAdminSide: boolean = false,
    user: UserEntity,
  ): Promise<Pagination<IFileOutput>> {
    const queryBuilder = this.fileRepository.createQueryBuilder(this.table);
    queryBuilder.orderBy(`${this.table}.createdAt`, 'DESC');
    for (const item of transformRelations(this.table, this.relations)) {
      queryBuilder.leftJoinAndSelect(item.property, item.alias);
    }
    if (!isAdminSide) {
      queryBuilder.where(`uploader.id = ${user.id}`);
    }
    const files: Pagination<FileEntity> = await paginate<FileEntity>(
      queryBuilder,
      options,
    );

    if (isAdminSide) {
      return {
        ...files,
        items: files.items.map(v => v.toResponseObject(/**isAdminSide */ true)),
      };
    }
    return {
      ...files,
      items: files.items.map(v => v.toResponseObject()),
    };
  }

  /**
   * @description 单文件上传
   * @author Saxon
   * @date 2020-04-29
   * @param {*} files
   * @param {UserEntity} user
   * @returns
   * @memberof FileService
   */
  async createSingleByFile(
    files: any,
    fileDTO: CreateFileDTO,
    user: UserEntity,
  ) {
    if (!files || isEmpty(files)) {
      throw new BadRequestException('亲，文件参数不正确');
    }
    // if (files.fieldname === 'image')
    const newFiles = {
      filename: files.filename,
      originalname: files.originalname,
      size: files.size,
      mimetype: files.mimetype,
      uploader: user,
    };

    const creatingFile = this.fileRepository.create(newFiles);

    try {
      const savingFile = await this.fileRepository.save(creatingFile);
      const { purpose } = fileDTO;
      // 关联到用户头像
      if (purpose === FilePurposeEnum.AVATAR) {
        await this.userService.updateAvatar(savingFile, user);
      }
      return savingFile.toResponseObject();
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(error.message, '服务器异常');
    }
  }

  async createSingleByUrl(fileDTO: CreateFileDTO, user: UserEntity) {
    const { url } = fileDTO;
    if (!url) {
      throw new BadRequestException('亲，传入的参数不正确');
    }
    const filename = `network-${this.multerConfigService.uniqueSuffix}`;
    const filePath = join(this.multerConfigService.filePath, filename);
    try {
      const res = await fetch(url);

      const buffer = await res.buffer();
      const storedMimeType = await fileType.fromBuffer(buffer);
      const acceptFileType = this.multerConfigService.acceptFileType(
        storedMimeType.mime,
      );
      if (!acceptFileType[0]) {
        throw new BadRequestException(acceptFileType[1]);
      }
      fs.writeFileSync(filePath, buffer);
      const stats = fs.statSync(filePath);

      const newFiles = {
        filename,
        originalname: url.substr(url.lastIndexOf('/') + 1),
        size: stats.size,
        mimetype: storedMimeType.mime,
        uploader: user,
      };

      const creatingFile = this.fileRepository.create(newFiles);
      const savingFile = await this.fileRepository.save(creatingFile);
      return savingFile.toResponseObject();
    } catch (error) {
      this.logger.error(error);
      throw new NotFoundException('亲，文件不存在或已损坏');
    }
  }

  /**
   * @description 多文件上传
   * @author Saxon
   * @date 2020-04-29
   * @param {*} files
   * @param {UserEntity} user
   * @returns
   * @memberof FileService
   */
  async createMultiple(files: any, user: UserEntity) {
    if (!files || isEmpty(files) || !Array.isArray(files)) {
      throw new BadRequestException('亲，文件参数不正确');
    }
    const newFiles = files.map(file => ({
      filename: file.filename,
      originalname: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
      uploader: user,
    }));

    const creatingFile = this.fileRepository.create(newFiles);

    try {
      const savingFile = await this.fileRepository.save(creatingFile);
      return savingFile.map(v => v.toResponseObject());
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(error.message, '服务器异常');
    }
  }

  /**
   * @description 渲染图片,无需扩展名
   * @author Saxon
   * @date 2020-04-29
   * @param {string} slug
   * @param {Response} res
   * @memberof FileService
   */
  async renderImage(slug: string, res: Response, options) {
    const { format, both = '500x500', gaussblur } = options;
    // ~~双非按位取反运算符，比Math.floor()更快。
    // 正数，向下取整；负数，向上取整；非数字取值为0
    const [width, height] = both.split('x').map((v: string) => Math.abs(~~v));
    if (!width || !height) {
      throw new BadRequestException('亲，宽度和高度是必须滴');
    }

    const filePath = join(
      __dirname,
      '..',
      '..',
      this.configService.get('STORAGE_DISK_PATH'),
      slug,
    );

    try {
      // 文件已存在，则取静态文；不存在，则动态生成并存为静态文件
      const transformFilePath = `${filePath}${
        isEmpty(options) ? '' : '#' + querystring.stringify(options)
      }`;
      const isExists = fs.existsSync(transformFilePath);
      if (!isExists) {
        // const buffer = readChunk.sync(filePath, 0, 4100);
        // const storedMimeType = await fileType.fromBuffer(buffer);
        // const readStream = fs.createReadStream(filePath);
        const transform = sharp(filePath).resize(width, height);

        // let mime = storedMimeType.mime;
        if (format) {
          transform.toFormat(format);
          // mime = transform.options.formatOut;
        }
        if (gaussblur) {
          transform.blur(Math.abs(~~gaussblur));
        }
        // res.type(mime);
        await transform.toFile(transformFilePath);
        // readStream.pipe(transform).pipe(res);
      }
      fs.createReadStream(transformFilePath).pipe(res);
    } catch (error) {
      this.logger.error(error);
      throw new NotFoundException('亲，文件不存在或已损坏');
    }
  }

  /**
   * @description 合并图片
   * @author Saxon
   * @date 2020-05-05
   * @param {string} text
   * @param {string} filename
   * @returns
   * @memberof FileService
   */
  private async compositeImage(text: string, filename: string): Promise<string> {
    const filePath = join(this.multerConfigService.filePath, filename);

    const isExists = fs.existsSync(filePath);
    try {
      if (!isExists) {
        const roundedCorners = Buffer.from(
          '<svg><rect x="0" y="0" width="200" height="200" rx="50" ry="50"/></svg>',
        );

        const img = sharp({
          create: {
            width: 400,
            height: 400,
            channels: 4,
            background: { r: 247, g: 250, b: 252 },
          },
        });
        if (text) {
          const svgOptions = {
            x: 0,
            y: 0,
            fontSize: 48,
            anchor: 'top',
            attributes: { fill: '#e2e8f0' },
          };
          const textToSVG = TextToSVG.loadSync(
            join(__dirname, '..', '..', 'fonts/MSYH.otf'),
          );
          const svg = textToSVG.getSVG(text, svgOptions);
          img.composite([
            { input: Buffer.from(svg), gravity: sharp.gravity.center },
          ]);
        }
        img.toFormat('jpg');
        await img.toFile(filePath);
      }
      return filePath;
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(error.message, '服务器异常');
    }
  }

  /**
   * @description 生成占位图
   * @author Saxon
   * @date 2020-05-05
   * @param {string} text
   * @param {string} filename
   * @returns
   * @memberof FileService
   */
  async makePlaceholder(text: string, filename: string): Promise<string> {
    return await this.compositeImage(text, filename);
  }
}
