import { IsString, IsNotEmpty, IsUUID, UUIDVersion } from 'class-validator';

export class CreateCommentDTO {
  @IsString()
  @IsNotEmpty()
  content: string;

  @IsUUID(process.env.UUID_VERSION as UUIDVersion, {
    message: '亲，无效的articleId',
  })
  @IsNotEmpty()
  articleId: string;
}
