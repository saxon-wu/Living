import { IsUUID } from 'class-validator';

export class ParamDTO {
  @IsUUID('4', {
    message: '亲，ID无效',
  })
  uuid: string;
}
