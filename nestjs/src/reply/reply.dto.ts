import { IsNotEmpty, IsString, IsUUID, IsOptional } from 'class-validator';

export class CreateReplyDTO {
  @IsUUID()
  @IsNotEmpty()
  commentId: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsUUID()
  @IsNotEmpty()
  @IsOptional()
  replyParentId?: string;
}
