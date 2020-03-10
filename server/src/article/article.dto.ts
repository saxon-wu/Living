import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
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
