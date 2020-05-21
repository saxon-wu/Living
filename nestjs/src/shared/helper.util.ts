import * as _ from 'lodash';
import dayjs from 'dayjs';
import * as fs from 'fs';
import { Type } from '@nestjs/common';

/**
 * @description 转为大写下划线拼接
 * @author Saxon
 * @date 2020-02-18
 * @export
 * @param {string} word
 * @returns {string}
 */
export function snakeUpperCase(str: string): string {
  if (!str) {
    return '';
  }
  return _.snakeCase(str) // 转为下划线拼接
    .toUpperCase() // 转为大写
    .trim(); // 去空隔
}

/**
 * @description 日期时间格式化(年-月-日 时:分:秒)
 * 以下示例的情况的'Invalid Date'是Date类型，moment的format是string类型
 * var d = new Date('k');
 * console.log(d.toString()); // shows 'Invalid Date'
 * console.log(typeof d); // shows 'object'
 * console.log(d instanceof Date); // shows 'true'
 * @author Saxon
 * @date 2020-02-18
 * @export
 * @param {(Date | number)} date
 * @returns {string}
 */
export function formatDate(date: Date | number): string | null {
  return isValidDate(date) ? dayjs(date).format('YYYY-MM-DD HH:mm:ss') : null;
}

/**
 * @description 枚举转为数组
 * @author Saxon
 * @date 2020-02-18
 * @export
 * @param {*} enumVariable
 * @returns {string[]}
 */
export function enumToArray(enumVariable: any): string[] {
  return Object.keys(enumVariable).map(key => enumVariable[key]);
}

/**
 * @description 字符串转换成驼峰写法
 * @author Saxon
 * @date 2020-02-18
 * @export
 * @param {string} str
 * @returns {string}
 */
export function camelCase(str: string): string {
  return str
    .toLowerCase() // 转小写
    .split(' ') // 按空隔分割成数组
    .map(word => word.replace(word[0], word[0].toUpperCase())) // 数组每个元素的第一个字母转大写
    .join(' '); // 连接成字符串
}

/**
 * @description 获取锚点id, 用于swgger注解
 * @author Saxon
 * @date 2020-02-18
 * @export
 * @param {string} operation
 * @param {string} [description]
 * @returns
 */
export function getApiOperationOptions(
  operation: string,
  description?: string,
) {
  return {
    summary: operation,
    operationId: `${operation}`, // swagger页面中作为锚点id
    description,
  };
}

/**
 * @description 创建文件夹的同步方法
 * @author Saxon
 * @date 2020-02-21
 * @export
 * @param {string} dirPath
 */
export function mkdirSync(dirPath: string): void {
  try {
    fs.mkdirSync(dirPath);
  } catch (err) {
    if (err.code !== 'EEXIST') {
      throw err;
    }
  }
}

/**
 * @description 字符串转为数组
 * @author Saxon
 * @date 2020-03-02
 * @export
 * @param {(string | Array<any>)} str
 * @returns {Array<any>}
 */
export function stringToArray(str: string | Array<any>): Array<any> {
  return Array.isArray(str) ? str : [str];
}

/**
 * @description 验证是不是有效的日期格式，
 * 是否是Invalid Date，Invalid Date是Date的实例
 * isValidDate(new Date()) // true |有效
 * isValidDate(new Date('f')) // false |无效
 * isValidDate(1583290648663) // true |有效
 * isValidDate('1583290648663') // true |有效
 * isValidDate(1) // true |有效
 * @author Saxon
 * @date 2020-03-04
 * @export
 * @param {(Date | number)} date
 * @returns {boolean}
 */
export function isValidDate(date: Date | number): boolean {
  // Case 1: Date
  if (date instanceof Date) {
    return !isNaN(date as any);
  } else if (date === null) {
    // Case 2: Null
    return false;
  }
  // Case 3: timestamp
  // new parse() 返回时间戳或NAN，并且毫秒精度会失去
  return !isNaN(Date.parse(new Date(date).toString()));
}

/**
 * @description 是否是开发环境
 * @author Saxon
 * @date 2020-03-09
 * @export
 * @returns {boolean}
 */
export function isDevelopment(): boolean {
  return process.env.NODE_ENV === 'development';
}

/**
 * @description 转换关联给SelectQueryBuilder使用
 * @author Saxon
 * @date 2020-05-03
 * @export
 * @param {string} tableName
 * @param {string[]} relations 
 * 转换前
 * [
    'commenter',
    'likes',
    'replies',
    'replies.likes',
    'replies.replier',
    'replies.replier.avatar',
  ];
 * @returns
 转换后
  [
    { property: 'comment.commenter', alias: 'comment_commenter' },
    { property: 'comment.likes', alias: 'comment_likes' },
    { property: 'comment.replies', alias: 'comment_replies' },
    { property: 'comment_replies.likes', alias: 'comment_replies_likes' },
    { property: 'comment_replies.replier', alias: 'comment_replies_replier' },
    { property: 'comment_replies_replier.avatar', alias: 'comment_replies_replier_avatar', },
  ];
 */
export function transformRelations(tableName: string, relations: string[]) {
  // splice会改变原数组，slice不会改变原数组
  return relations.map(v => {
    const subArray = v.split('.');
    const property =
      subArray.length === 1
        ? `${tableName}.${v}`
        : `${tableName}_${subArray
            .splice(0, subArray.length - 1)
            .join('_')}.${subArray.splice(-1)}`;
    const alias = `${tableName}_${v.replace(/\./g, '_')}`;
    return {
      property,
      alias,
    };
  });
}

/**
 * @description filename转成完整的url
 * @author Saxon
 * @date 2020-05-12
 * @export
 * @param {string} filename
 * @returns
 */
export function filenameToUrl(filename: string) {
  return `${process.env.API_IMAGE_URL_PREFIX}/api/v1/file/image/${filename}`;
}
