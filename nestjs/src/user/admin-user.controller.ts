import {
  Controller,
  Get,
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
import { UUIDParamDTO, IdParamDTO } from '@src/shared/shared.dto';
import { UserEntity } from './user.entity';
import { UpdateUserForAdminDTO } from './user.dto';

const MANY = 'users';
const ONE = 'user';

  @UseGuards(AuthGuard)
  @Controller('v1/admin')
export class AdminUserController {
  constructor(private readonly userService: UserService) {}

  @Get(MANY)
  async findAll(
    @Query('current') page: number = 1,
    @Query('pageSize') limit: number = 10,
  ) {
    // nestjs 7.0 自动转换number,bool未传时则为NaN,false
    if (isNaN(page)) page = 1;
    if (isNaN(limit)) limit = 10;
    return await this.userService.findAll({ page, limit }, /* isAdminSide */true);
  }

  @Get(`${ONE}/:id`)
  async findOne(@Param() paramDTO: IdParamDTO) {
    return await this.userService.findOne(paramDTO, /* returnsEntity */true);
  }

  @Delete(`${ONE}/destruct`)
  async destroy(@User() user: UserEntity) {
    return await this.userService.destroy(user);
  }

  @Get(`${ONE}/whoami/x`)
  async whoami(@User() user: UserEntity) {
    const { uuid } = user;
    return await this.userService.findOne({ uuid });
  }

  
  @Put(`${ONE}/:id`)
  async update(
    @Param() userParamDTO: IdParamDTO,
    @Body() userDTO: UpdateUserForAdminDTO,
    @User() user: UserEntity,
  ) {
    return await this.userService.updateForAdmin(userParamDTO, userDTO);
  }
}
