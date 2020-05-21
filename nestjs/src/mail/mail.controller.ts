import { Controller, Post, Body, UseGuards, Get, Param } from '@nestjs/common';
import { MailService } from './mail.service';
import { User } from '@src/shared/user.decorator';
import { UserEntity } from '@src/user/user.entity';
import { AuthGuard } from '@src/shared/auth.guard';

@Controller('v1/mail')
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @UseGuards(AuthGuard)
  @Post('sendEmail')
  async transcode(@User() user: UserEntity,) {
    return await this.mailService.addQueue(user);
  }

  @Get('state/:id')
  getJobState(@Param('id') id: string) {
    return this.mailService.getState(Number(id));
  }
}
