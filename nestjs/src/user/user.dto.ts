import { IsString, IsNotEmpty, IsOptional, IsEnum, IsUUID, UUIDVersion } from 'class-validator';
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
  @IsUUID(process.env.UUID_VERSION as UUIDVersion, {
    message: '亲，无效的avatarId',
  })
  @IsNotEmpty()
  avatarId: string;
}

export class UpdateUserForAdminDTO {
  @IsNotEmpty()
  @IsString()
  @IsEnum(UserStatusEnum)
  status: UserStatusEnum;
}
