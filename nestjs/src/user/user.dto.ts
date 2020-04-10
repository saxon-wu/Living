import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';
import { UserStatusEnum } from './user.enum';


export class CreateUserDTO {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}

export class UpdateUserDTO {
  @IsNotEmpty()
  @IsString()
  @IsEnum(UserStatusEnum)
  status: UserStatusEnum;
}
