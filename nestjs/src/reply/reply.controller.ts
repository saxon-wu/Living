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
import { UUIDParamDTO } from '@src/shared/shared.dto';
import { CreateReplyDTO } from './reply.dto';
import { AuthGuard } from '@src/shared/auth.guard';
import { User } from '@src/shared/user.decorator';
import { UserEntity } from '@src/user/user.entity';
import { IReplyOutput } from './reply.interface';

const MANY = 'replies';
const ONE = 'reply';

@Controller('v1')
export class ReplyController {
  constructor(private readonly replyService: ReplyService) {}

  @UseGuards(AuthGuard)
  @Post(ONE)
  async create(
    @Body() createReplyDTO: CreateReplyDTO,
    @User() user: UserEntity,
  ): Promise<IReplyOutput> {
    return await this.replyService.create(createReplyDTO, user);
  }

  @UseGuards(AuthGuard)
  @Delete(`${ONE}/:uuid`)
  async softDelete(
    @Param() replyParamDTO: UUIDParamDTO,
    user: UserEntity,
  ): Promise<string> {
    return await this.replyService.softDelete(replyParamDTO, user);
  }

  @UseGuards(AuthGuard)
  @Patch(`${ONE}/:uuid`)
  async softRestore(
    @Param() replyParamDTO: UUIDParamDTO,
    user: UserEntity,
  ): Promise<string> {
    return await this.replyService.softRestore(replyParamDTO, user);
  }

  @UseGuards(AuthGuard)
  @Post(`${ONE}/:uuid/like`)
  async like(
    @Param() replyParamDTO: UUIDParamDTO,
    @User() user: UserEntity,
  ): Promise<IReplyOutput> {
    return await this.replyService.like(replyParamDTO, user);
  }
}
