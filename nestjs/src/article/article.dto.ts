import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsObject,
  IsBoolean,
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
