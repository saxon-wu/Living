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
import { CreateUserDTO } from './user.dto';
import { UserService } from './user.service';
import { AuthGuard } from 'src/shared/auth.guard';
import { User } from 'src/shared/user.decorator';
import { ParamDTO } from 'src/shared/shared.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async findAll() {
    return await this.userService.findAll();
  }

  @Get(':uuid')
  async findOne(@Param() paramDTO: ParamDTO) {
    return await this.userService.findOne(paramDTO);
  }

  @UseGuards(AuthGuard)
  @Delete('destruct')
  async destroy(@User() user) {
    return await this.userService.destroy(user);
  }
}
