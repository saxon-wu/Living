import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';
import { ArticleStatusEnum } from './article.enum';
export class CreateArticleDTO {
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsOptional()
  @IsNotEmpty()
  @IsString()
  content: string;
}

export class UpdateArticleDTO {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  content: string;
}

export class UpdateArticleDTOForAdmin {
  @IsNotEmpty()
  @IsString()
  @IsEnum(ArticleStatusEnum)
  status: ArticleStatusEnum;
}