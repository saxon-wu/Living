import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { AuthGuard } from '@src/shared/auth.guard';
import { User } from '@src/shared/user.decorator';
import { ParamDTO } from '@src/shared/shared.dto';
import { UserEntity } from './user.entity';

const MANY = 'users';
const ONE = 'user'

@Controller('v1')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get(MANY)
  async findAll() {
    return await this.userService.findAll();
  }

  @Get(`${ONE}/:uuid`)
  async findOne(@Param() paramDTO: ParamDTO) {
    return await this.userService.findOne(paramDTO);
  }

  // TODO: test时调用
  async findOneForTest(paramDTO: ParamDTO): Promise<UserEntity> {
    return await this.userService.findOneByuuidForUser(paramDTO, true);
  }
  // TODO: test时调用
  async findAllForTest(
    returnsUserEntity: boolean = false,
  ): Promise<UserEntity[] | any> {
    return await this.userService.findAll(returnsUserEntity);
  }

  @UseGuards(AuthGuard)
  @Delete(`${ONE}/destruct`)
  async destroy(@User() user: UserEntity) {
    return await this.userService.destroy(user);
  }
}
