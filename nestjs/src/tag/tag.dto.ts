import { IsNotEmpty, IsString, IsOptional, IsInt } from 'class-validator';

export class CreateTagDTO {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  describe: string;

  @IsOptional()
  @IsInt()
  parentId?: number;
}

export class UpdateTagDTO {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  describe: string;

  @IsNotEmpty()
  @IsInt()
  parentId: number;
}
