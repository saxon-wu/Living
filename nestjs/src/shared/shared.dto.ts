import { IsUUID, IsInt, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer/decorators';

export class UUIDParamDTO {
  @IsUUID('4', {
    message: '亲，ID无效',
  })
  uuid: string;
}

export class IdParamDTO {
  @Type(() => Number)
  @IsInt()
  @IsNotEmpty()
  id: number;
}