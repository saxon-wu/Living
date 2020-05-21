import { Injectable, BadRequestException } from '@nestjs/common';
import {
  MulterOptionsFactory,
  MulterModuleOptions,
} from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';
import * as multer from 'multer';

@Injectable()
export class MulterConfigService implements MulterOptionsFactory {
  private readonly MIME_TYPE_MAP = {
    'image/png': 'png',
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
  };
  public uniqueSuffix = (): string =>
    `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
  public filePath: string = join(
    __dirname,
    '..',
    '..',
    this.configService.get('STORAGE_DISK_PATH'),
  );
  
  constructor(private readonly configService: ConfigService) {}

  /**
   * @description 接收文件类型检测
   * 允许则为true，不允许则为false
   * @author Saxon
   * @date 2020-05-04
   * @param {string} mimetype
   * @returns {boolean}
   * @memberof MulterConfigService
   */
  acceptFileType(mimetype: string): [boolean, string] {
    return [
      Object.keys(this.MIME_TYPE_MAP).includes(mimetype),
      `Only ${Object.values(this.MIME_TYPE_MAP)} format allowed!`,
    ];
  }

  createMulterOptions(): MulterModuleOptions {
    return {
      storage: multer.diskStorage({
        destination: (req, file, cb) => {
          cb(null, this.filePath);
        },
        filename: async (req, file, cb) => {
          /**
           * TODO:
           * 1.未解决当更改扩展名的伪装文件类型上传时未能识别原文件类型
           * 2.使用file-type库中的fromStream函数识别文件类型后，存储的文件已损坏
           * 3.目前解决办法是不要extention,静态文件通过接口渲染
           */

          const ext = this.MIME_TYPE_MAP[file.mimetype];
          cb(null, `${file.fieldname}-${this.uniqueSuffix()}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        // 阻止MIME_TYPE_MAP中没有的类型上传
        const acceptFileType = this.acceptFileType(file.mimetype);
        if (!acceptFileType[0]) {
          return cb(new BadRequestException(acceptFileType[1]), false);
        }
        cb(null, true);
      },
      limits: {
        fileSize: 1024 * 1024, // 1024byte(1k)*1024=1M
      },
    };
  }
}
