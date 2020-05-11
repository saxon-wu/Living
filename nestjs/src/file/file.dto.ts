import {
  IsOptional,
  IsEnum,
  IsNotEmpty,
  IsString,
  IsUrl,
} from 'class-validator';
import { FilePurposeEnum } from './file.enum';

export class CreateFileDTO {
  @IsOptional()
  @IsEnum(FilePurposeEnum)
  purpose?: FilePurposeEnum;

  @IsOptional()
  @IsUrl()
  url?: string;
}

export class FilenameParamDTO {
  @IsNotEmpty()
  @IsString()
  filename: string;
}
