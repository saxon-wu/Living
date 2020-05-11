/**
 * @description 枚举转为数组
 * @author Saxon
 * @date 2020-04-17
 * @export
 * @param {*} enumVariable
 * @returns {string[]}
 */
export function enumToArray(enumVariable: any): string[] {
  return Object.keys(enumVariable).map((key) => enumVariable[key]);
}


