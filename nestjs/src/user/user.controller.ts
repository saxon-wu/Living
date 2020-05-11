import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
  Query,
} from '@nestjs/common';
import { UserService } from './user.service';
import { AuthGuard } from '@src/shared/auth.guard';
import { User } from '@src/shared/user.decorator';
import { UUIDParamDTO } from '@src/shared/shared.dto';
import { UserEntity } from './user.entity';
import { UpdateUserDTO } from './user.dto';

const MANY = 'users';
const ONE = 'user';

@Controller('v1')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get(MANY)
  async findAll(
    @Query('current') page: number = 1,
    @Query('pageSize') limit: number = 10,
  ) {
    // nestjs 7.0 自动转换number,bool未传时则为NaN,false
    if (isNaN(page)) page = 1;
    if (isNaN(limit)) limit = 10;
    return await this.userService.findAll({ page, limit });
  }

  @Get(`${ONE}/:uuid`)
  async findOne(@Param() paramDTO: UUIDParamDTO) {
    return await this.userService.findOne(paramDTO);
  }

  // // TODO: test时调用
  // async findOneForTest(paramDTO: UUIDParamDTO): Promise<UserEntity> {
  //   return <UserEntity>await this.userService.findOneForUser(paramDTO, true);
  // }
  // // TODO: test时调用
  // async findAllForTest(
  //   returnsEntity: boolean = false,
  // ): Promise<UserEntity[] | any> {
  //   return await this.userService.findAll(returnsEntity);
  // }

  @UseGuards(AuthGuard)
  @Delete(`${ONE}/destruct`)
  async destroy(@User() user: UserEntity) {
    return await this.userService.destroy(user);
  }

  @UseGuards(AuthGuard)
  @Get(`${ONE}/whoami/x`)
  async whoami(@User() user: UserEntity) {
    const { uuid } = user;
    return await this.userService.findOne({ uuid });
  }

  @UseGuards(AuthGuard)
  @Put(`${ONE}/update`)
  async update(@Body() updateUserDTO: UpdateUserDTO, @User() user: UserEntity) {
    return this.userService.update(updateUserDTO, user);
  }
}
