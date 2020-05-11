import { IsNotEmpty, IsString, IsUUID, IsOptional, UUIDVersion } from 'class-validator';

export class CreateReplyDTO {
  @IsUUID(process.env.UUID_VERSION as UUIDVersion, {
    message: '亲，无效的commentId',
  })
  @IsNotEmpty()
  commentId: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsUUID(process.env.UUID_VERSION as UUIDVersion, {
    message: '亲，无效的replyParentId',
  })
  @IsNotEmpty()
  @IsOptional()
  replyParentId?: string;
}
