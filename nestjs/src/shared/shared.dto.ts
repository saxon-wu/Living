import {
  IsUUID,
  IsInt,
  IsNotEmpty,
  IsString,
  UUIDVersion,
} from 'class-validator';
import { Type } from 'class-transformer/decorators';

export class UUIDParamDTO {
  @IsUUID(process.env.UUID_VERSION as UUIDVersion, {
    message: '亲，无效的ID',
  })
  id: string;
}

export class IdParamDTO {
  @Type(() => Number)
  @IsInt()
  @IsNotEmpty()
  id: number;
}

export class TitleParamDTO {
  @IsString()
  @IsNotEmpty()
  title: string;
}
