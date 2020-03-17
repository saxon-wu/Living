import {
  Controller,
  Post,
  Param,
  Body,
  Delete,
  UseGuards,
  Patch,
} from '@nestjs/common';
import { ReplyService } from './reply.service';
import { ParamDTO } from '@src/shared/shared.dto';
import { CreateReplyDTO } from './reply.dto';
import { AuthGuard } from '@src/shared/auth.guard';
import { User } from '@src/shared/user.decorator';
import { UserEntity } from '@src/user/user.entity';

@Controller('reply')
export class ReplyController {
  constructor(private readonly replyService: ReplyService) {}

  @UseGuards(AuthGuard)
  @Post()
  async create(
    @Body() createReplyDTO: CreateReplyDTO,
    @User() user: UserEntity,
  ) {
    return await this.replyService.create(createReplyDTO, user);
  }

  @UseGuards(AuthGuard)
  @Delete(':uuid')
  async softDelete(@Param() replyParamDTO: ParamDTO, user: UserEntity) {
    return await this.replyService.softDelete(replyParamDTO, user);
  }

  @UseGuards(AuthGuard)
  @Patch(':uuid')
  async softRestore(@Param() replyParamDTO: ParamDTO, user: UserEntity) {
    return await this.replyService.softRestore(replyParamDTO, user);
  }

  @UseGuards(AuthGuard)
  @Post(':uuid/like')
  async like(@Param() replyParamDTO: ParamDTO, @User() user: UserEntity) {
    return await this.replyService.like(replyParamDTO, user);
  }
}