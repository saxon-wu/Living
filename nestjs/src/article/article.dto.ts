import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsObject,
  IsBoolean,
  IsUUID,
  UUIDVersion,
} from 'class-validator';
import { ArticleStatusEnum } from './article.enum';
import { IContent } from './article.interface';

export class CreateArticleDTO {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsObject()
  content: IContent;

  @IsNotEmpty()
  @IsBoolean()
  isPublic: boolean;

  @IsUUID(process.env.UUID_VERSION as UUIDVersion, {
    message: '亲，无效的ID',
  })
  @IsOptional()
  coverId?: string;
}

export class UpdateArticleDTO {
  otherProperty: string;

  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsObject()
  content: IContent;

  @IsNotEmpty()
  @IsBoolean()
  isPublic: boolean;
}

export class UpdateArticleDTOForAdmin {
  @IsNotEmpty()
  @IsString()
  @IsEnum(ArticleStatusEnum)
  status: ArticleStatusEnum;
}
