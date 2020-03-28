import { IsString, IsNotEmpty, IsUUID } from 'class-validator';

export class CreateCommentDTO {
  @IsString()
  @IsNotEmpty()
  content: string;

  @IsUUID()
  @IsNotEmpty()
  articleId: string;
}
