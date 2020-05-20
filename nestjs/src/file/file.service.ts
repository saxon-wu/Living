import {
  Injectable,
  Logger,
  InternalServerErrorException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { FileEntity } from './file.entity';
import _ from 'lodash';
import { IFileOutput, IFileProperty } from './file.interface';
import {
  IPaginationOptions,
  Pagination,
  paginate,
} from 'nestjs-typeorm-paginate';
import { UserEntity } from '@src/user/user.entity';
import { isEmpty } from 'lodash';
import { ConfigService } from '@nestjs/config';
import { join, resolve } from 'path';
import readChunk from 'read-chunk';
import fileType from 'file-type';
import fs from 'fs';
import { Response } from 'express';
import sharp from 'sharp';
import querystring from 'querystring';
import { CreateFileDTO, FilenameParamDTO } from './file.dto';
import { UserService } from '@src/user/user.service';
import { FilePurposeEnum } from './file.enum';
import {
  transformRelations,
  randomRangeInteger,
  filenameToUrl,
} from '@src/shared/helper.util';
import { UUIDParamDTO } from '@src/shared/shared.dto';
import fetch from 'node-fetch';
import { MulterConfigService } from '@src/shared/multer-config.service';
import TextToSVG from 'text-to-svg';
import svgGradient from 'svg-gradient';
import randomColor from 'randomcolor';

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
   * @param {(UUIDParamDTO | FilenameParamDTO)} paramDTO
   * @param {(UserEntity | null)} [user]
   * @returns {Promise<FileEntity>}
   * @memberof FileService
   */
  async findOneForFile(
    paramDTO: UUIDParamDTO | FilenameParamDTO,
    user?: UserEntity | null,
  ): Promise<FileEntity> {
    let file: FileEntity;
    if ((paramDTO as FilenameParamDTO).filename) {
      const { filename } = <FilenameParamDTO>paramDTO;
      file = await this.fileRepository.findOne(
        { filename },
        {
          relations: this.relations,
        },
      );
    } else if ((paramDTO as UUIDParamDTO).id) {
      const { id } = <UUIDParamDTO>paramDTO;
      file = await this.fileRepository.findOne(id, {
        relations: this.relations,
      });
    } else {
      throw new BadRequestException('亲，传入的参数不正确');
    }

    if (!file) {
      throw new NotFoundException('文件不存在');
    }

    return file;
  }

  /**
   * @description 查询一条 输出给客户端
   * @author Saxon
   * @date 2020-05-03
   * @param {(UUIDParamDTO | FilenameParamDTO)} paramDTO
   * @param {(UserEntity | null)} [user]
   * @returns {Promise<FileEntity>}
   * @memberof FileService
   */
  async findOne(
    paramDTO: UUIDParamDTO | FilenameParamDTO,
    user?: UserEntity | null,
  ): Promise<FileEntity> {
    return await this.findOneForFile(paramDTO, user);
  }

  async findAll(
    options: IPaginationOptions,
    isAdminSide: boolean = false,
    user: UserEntity,
  ): Promise<Pagination<FileEntity>> {
    const queryBuilder = this.fileRepository.createQueryBuilder(this.table);
    queryBuilder.orderBy(`${this.table}.createdAt`, 'DESC');
    for (const item of transformRelations(this.table, this.relations)) {
      queryBuilder.leftJoinAndSelect(item.property, item.alias);
    }
    if (!isAdminSide) {
      queryBuilder.where(`${this.table}.uploader.id = :id`, { id: user.id });
    }
    const files: Pagination<FileEntity> = await paginate<FileEntity>(
      queryBuilder,
      options,
    );

    return files;
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
  ): Promise<FileEntity> {
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
      // 去掉uploader，无需要
      delete savingFile.uploader;
      // save不会返回@AfterLoad的属性，这里需要手动添加
      savingFile.url = filenameToUrl(savingFile.filename);
      return savingFile;
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
      return savingFile;
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
      return savingFile;
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
      // const buffer = readChunk.sync(filePath, 0, 4100);
      // const storedMimeType = await fileType.fromBuffer(buffer);
        const storedMimeType = await fileType.fromFile(filePath);
        let mime = storedMimeType.mime;
      
      const isExists = fs.existsSync(transformFilePath);
      if (!isExists) {
        // const readStream = fs.createReadStream(filePath);
        const transform = sharp(filePath).resize(width, height);

        if (format) {
          transform.toFormat(format);
          // mime = transform.options.formatOut;
        }
        if (gaussblur) {
          transform.blur(Math.abs(~~gaussblur));
        }
        await transform.toFile(transformFilePath);
        // readStream.pipe(transform).pipe(res);
      }
      res.type(mime);
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
  private async compositeImage(
    text: string,
    filename?: string,
    returnFileProperty?: boolean,
  ): Promise<string | IFileProperty> {
    const _filename = `generated-${this.multerConfigService.uniqueSuffix}`;
    const filePath = join(
      this.multerConfigService.filePath,
      returnFileProperty ? _filename : filename,
    );

    const isExists = fs.existsSync(filePath);
    try {
      if (!isExists) {
        /* 生成灰度背景灰度文字或彩色渐变背景白色文字的图片*/
        const svgOptions = {
          x: 0,
          y: 0,
          fontSize: 48,
          anchor: 'top',
          attributes: { fill: returnFileProperty ? '#ffffff' : '#e2e8f0' },
        };
        const textToSVG = TextToSVG.loadSync(
          join(__dirname, '..', '..', 'fonts/MSYH.otf'),
        );
        const svg = textToSVG.getSVG(text, svgOptions);
        const svgMetrics = textToSVG.getMetrics(text, svgOptions);
        // 取宽高的最长的一边的N倍作为边长
        const width =
          (svgMetrics.width - svgMetrics.height > 0
            ? svgMetrics.width
            : svgMetrics.height) * 2;
        const colorList = [
          'red',
          'orange',
          'yellow',
          'green',
          'blue',
          'purple',
          'pink',
        ];
        //返回一个2-4种随机色的数组
        var colors = randomColor({
          count: randomRangeInteger(2, 4),
          hue: colorList[randomRangeInteger(0, colorList.length)],
        });
        // 生成渐变SVG
        const svgLinearGradient = svgGradient(
          `linear-gradient(${randomRangeInteger(0, 359)}deg, ${colors.join(
            ',',
          )})`,
        );
        const index = svgLinearGradient.indexOf('>');
        if (index === -1) {
          throw new InternalServerErrorException('生成的SVG不标准');
        }
        // 渐变SVG本没有宽高，是最小的SVG，这里设置宽高
        const svgLinearGradientWithWidth = `${svgLinearGradient.substr(
          0,
          index,
        )} width='${width}' height='${width}' ${svgLinearGradient.substr(
          index,
        )}`;
        let input: any = {
          create: {
            width: 400,
            height: 400,
            channels: 4,
            background: { r: 247, g: 250, b: 252 },
          },
        };
        if (returnFileProperty) {
          input = Buffer.from(svgLinearGradientWithWidth);
        }

        const img = sharp(input);

        img.composite([
          { input: Buffer.from(svg), gravity: sharp.gravity.center },
        ]);

        img.toFormat('jpg');
        await img.toFile(filePath);
      }
      if (returnFileProperty) {
        const stats = fs.statSync(filePath);
        const storedMimeType = await fileType.fromFile(filePath);
        const fileProperty = {
          filename: _filename,
          originalname: _filename,
          size: stats.size,
          mimetype: storedMimeType.mime,
        };
        return fileProperty;
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
  async makePlaceholder(
    text: string,
    filename?: string,
    returnFileProperty?: boolean,
  ): Promise<string | IFileProperty> {
    return await this.compositeImage(text, filename, returnFileProperty);
  }
}
